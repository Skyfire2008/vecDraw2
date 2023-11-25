interface SdfLayer {
	points: Array<PointLike>;
	lines: Array<Line>;
	polygons: Array<Polygon>;
}

interface SdfLineData {
	//from: Point;
	//to: Point;
	vec: Point;
	len: number;
	len2: number;
	//halfThickness: number;
}

class SDF {

	public static rgbSeparator(color: string, targets: Array<Array<number>>): number {
		const colorRgb = colorToRgb(color);

		let smallestDiff = Number.POSITIVE_INFINITY;
		let result = -1;
		for (let i = 0; i < targets.length; i++) {

			const targetColor = targets[i];
			let currentDiff = 0;

			for (let j = 0; j < 3; j++) {
				currentDiff += Math.abs(targetColor[j] - colorRgb[j]);
			}

			if (currentDiff < smallestDiff) {
				smallestDiff = currentDiff;
				result = i;
			}
		}

		return result;
	}

	private spread: number;
	private targetColors: Array<Array<number>>;
	private colorSeparator: (color: string, targets: Array<Array<number>>) => number;
	private sampleMult: number;

	private layers: Array<LayerData>;
	private mergedLayers: LayerData;
	private separatedLayers: { points: Array<Point>, channels: Array<{ lines: Array<Line>, polygons: Array<Polygon> }> };

	private vecData: Array<{ lines: Array<SdfLineData>, polygons: Array<Array<SdfLineData>> }>;

	constructor(spread: number, targetColors: Array<string>, colorSeparator: (color: string, targets: Array<Array<number>>) => number, sampleMult: number) {
		this.spread = spread;
		this.targetColors = [];
		for (const color of targetColors) {
			this.targetColors.push(colorToRgb(color));
		}

		this.colorSeparator = colorSeparator;
		this.sampleMult;
	}

	public setLayers(layers: Array<LayerData>) {
		this.layers = layers;
	}

	private mergeLayers() {
		this.mergedLayers = { points: [], lines: [], polygons: [] };

		for (const layer of this.layers) {
			for (const point of layer.points) {
				this.mergedLayers.points.push(point);
			};

			for (const line of layer.lines) {
				const newLine = Object.assign({}, line);
				newLine.from += this.mergedLayers.points.length;
				newLine.to += this.mergedLayers.points.length;
				this.mergedLayers.lines.push(newLine);
			}

			for (const polygon of layer.polygons) {
				const newPoly = { points: [], color: polygon.color };
				for (const point of polygon.points) {
					newPoly.points.push(point + this.mergedLayers.points.length);
				}

				this.mergedLayers.polygons.push(newPoly);
			}
		}
	}

	private separateColors() {
		this.separatedLayers = { points: this.mergedLayers.points, channels: [] };
		for (let i = 0; i < 4; i++) {
			this.separatedLayers.channels.push({ lines: [], polygons: [] });
		}

		for (const line of this.mergedLayers.lines) {
			const i = this.colorSeparator(line.color, this.targetColors);
			this.separatedLayers.channels[i].lines.push(line);
		}

		for (const polygon of this.mergedLayers.polygons) {
			const i = this.colorSeparator(polygon.color, this.targetColors);
			this.separatedLayers.channels[i].polygons.push(polygon);
		}
	}

	/*private preprocess() {
		this.vecData = [];

		for ()
	}*/
}

/**
 * Calcualtes the distance between line and segment
 * @param point point to calculate distance to
 * @param a 	segment's from point
 * @param b 	segments to point
 * @param data 	precomputed segment data
 * @param thickness segment thickness
 * @returns 
 */
const lineDistance = (point: PointLike, a: PointLike, b: PointLike, data: SdfLineData, thickness: number) => {
	const ap = Point.subtract(point, a);
	const projMult = Point.dot(ap, data.vec) / data.len2;

	let dist = 0;
	if (projMult < 0) {
		dist = Point.distance(a, point);
	} else if (projMult > 1) {
		dist = Point.distance(b, point);
	} else {
		const segPos = Point.scale(data.vec, projMult);
		segPos.add(a);
		dist = Point.distance(segPos, point);
		/*const foo = Point.distance2(a, point);
		const bar = projMult * data.len;
		dist = Math.sqrt(foo - bar * bar);*/
	}

	return dist - thickness / 2;
}

const generateSdf = (startX: number, startY: number, width: number, height: number, layers: Array<SdfLayer>, bytes: Uint8ClampedArray) => {
	for (let channel = 0; channel < 4; channel++) {

		if (channel == 3) {
			for (let x = 0; x < width; x++) {
				for (let y = 0; y < height; y++) {
					bytes[(y * width + x) * 4 + channel] = 255;
				}
			}
		}

		const layer = layers[channel];

		if (layer == null) {
			continue;
		}

		const lineVecs: Array<SdfLineData> = layer.lines.map((line) => {
			const vec = Point.subtract(layer.points[line.to], layer.points[line.from]);
			const len2 = vec.x * vec.x + vec.y * vec.y;
			const len = Math.sqrt(len2);
			return { vec, len, len2 };
		});

		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {

				let point: PointLike = { x: x + startX + 0.5, y: y + startY + 0.5 };

				let closest = Number.POSITIVE_INFINITY;

				for (let i = 0; i < layer.lines.length; i++) {
					const line = layer.lines[i];
					const from = Point.sum(layer.points[line.from], { x: 0.5, y: 0.5 });
					const to = Point.sum(layer.points[line.to], { x: 0.5, y: 0.5 });
					const distance = lineDistance(point, from, to, lineVecs[i], line.thickness);

					if (closest > distance) {
						closest = distance;
					}
				}

				//TODO: for every polygon here...
				/*for (let i = 0; i < layer.polygons.length; i++) {
					const polygon = layer.polygons[i];
					for (let j = 0; j < polygon.points.length; j++) {
						const current = polygon.points[j];
						const next = polygon.points[(j + 1) % polygon.points.length];

						const distance = lineDistance(point,)
					}
				}*/

				closest = Math.trunc(Math.max(128 - closest, 0));
				bytes[(y * width + x) * 4 + channel] = closest;

				if (closest > 127) {
					bytes[(y * width + x) * 4 + 1] = 255;
					bytes[(y * width + x) * 4 + 2] = 255;
				}
			}
		}
	}
};