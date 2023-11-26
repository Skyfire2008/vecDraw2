interface SdfLayerData {
	lines: Array<SdfLineData>;
	polygons: Array<Array<SdfLineData>>;
}

interface SdfLineData {
	from: Point;
	to: Point;
	vec: Point;
	len: number;
	len2: number;
	halfThickness: number;
}

//TODO: save steps that have already been completed
class SDF {

	/**
	 * Separates colors by closest RGB value
	 * @param color input colors as string
	 * @param targets array of target colors as [R, G, B] array
	 * @returns target index
	 */
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

	/**
	 * Generates precomputed segment data
	 * @param from 		segment starting point
	 * @param to 		segment ending point
	 * @param thickness segment thickness
	 * @param isLine 	is segment a line or polygon side?
	 * @returns 
	 */
	public static makeLineData(from: Point, to: Point, thickness: number, isLine: boolean): SdfLineData {
		const vec = Point.subtract(to, from);
		const len2 = vec.x * vec.x + vec.y * vec.y;
		const addPoint: PointLike = isLine ? { x: 0.5, y: 0.5 } : { x: 0, y: 0 };
		return {
			from: Point.sum(from, addPoint),
			to: Point.sum(to, addPoint),
			vec,
			len2,
			len: Math.sqrt(len2),
			halfThickness: thickness / 2
		};
	}

	/**
	* Calculates the distance between line and segment
	* @param point 	point to calculate distance to
	* @param data 	precomputed segment data
	* @returns 
	*/
	public static lineDistance = (point: PointLike, data: SdfLineData) => {
		const ap = Point.subtract(point, data.from);
		const projMult = Point.dot(ap, data.vec) / data.len2;

		let dist = 0;
		if (projMult < 0) {
			dist = Point.distance(data.from, point);
		} else if (projMult > 1) {
			dist = Point.distance(data.to, point);
		} else {
			const segPos = Point.scale(data.vec, projMult);
			segPos.add(data.from);
			dist = Point.distance(segPos, point);
		}

		return dist - data.halfThickness;
	}

	private spread: number;
	private targetColors: Array<Array<number>>;
	private colorSeparator: (color: string, targets: Array<Array<number>>) => number;
	private sampleMult: number;

	private layers: Array<LayerData>;

	private vecData: Array<SdfLayerData>;
	private dims: Dimensions;

	/**
	 * Creates new SDF generator
	 * @param spread 
	 * @param targetColors 
	 * @param colorSeparator 
	 * @param sampleMult 
	 */
	constructor(spread: number, targetColors: Array<string>, colorSeparator: (color: string, targets: Array<Array<number>>) => number, sampleMult: number) {
		this.spread = spread;
		this.targetColors = [];
		for (const color of targetColors) {
			this.targetColors.push(colorToRgb(color));
		}

		this.colorSeparator = colorSeparator;
		this.sampleMult = sampleMult;
	}

	public setLayers(layers: Array<LayerData>) {
		this.layers = layers;
	}

	public preprocess() {
		this.vecData = [];
		for (let i = 0; i < 4; i++) {
			this.vecData.push({
				lines: [],
				polygons: []
			});
		}

		for (const layer of this.layers) {
			for (const line of layer.lines) {
				const i = this.colorSeparator(line.color, this.targetColors);
				if (i < 0) { //skip if color separator returned negative
					continue;
				}

				const lineData = SDF.makeLineData(layer.points[line.from], layer.points[line.to], line.thickness, true);
				this.vecData[i].lines.push(lineData);
			}

			for (const polygon of layer.polygons) {
				const i = this.colorSeparator(polygon.color, this.targetColors);
				if (i < 0) { //skip if color separator returned negative
					continue;
				}

				const polyData: Array<SdfLineData> = [];
				for (let prev = 0; prev < polygon.points.length; prev++) {
					const next = (prev + 1) % polygon.points.length;
					polyData.push(SDF.makeLineData(layer.points[prev], layer.points[next], 0, true));
				}

				this.vecData[i].polygons.push(polyData);
			}
		}

		//calculate dimensions
		let left = Number.POSITIVE_INFINITY;
		let right = Number.NEGATIVE_INFINITY;
		let top = Number.POSITIVE_INFINITY;
		let bottom = Number.NEGATIVE_INFINITY;
		for (const channel of this.vecData) {
			for (const line of channel.lines) {
				left = Math.min(left, line.from.x - line.halfThickness, line.to.x - line.halfThickness);
				right = Math.max(right, line.from.x + line.halfThickness, line.to.x + line.halfThickness);
				top = Math.min(top, line.from.y - line.halfThickness, line.to.y - line.halfThickness);
				bottom = Math.max(bottom, line.from.y + line.halfThickness, line.to.y + line.halfThickness);
			}
		}

		left = Math.floor(left);
		right = Math.ceil(right);
		top = Math.floor(top);
		bottom = Math.ceil(bottom);

		this.dims = { left, right, top, bottom };
	}

	public generate(callback: (state: string, ratio: number) => void): HTMLCanvasElement {
		const canvas = document.createElement("canvas");

		const width = this.dims.right - this.dims.left + this.spread * 2;
		const height = this.dims.bottom - this.dims.top + this.spread * 2;
		const startX = this.dims.left - this.spread;
		const startY = this.dims.top - this.spread;

		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext("2d");
		const imgData = ctx.createImageData(canvas.width, canvas.height, { colorSpace: "srgb" });

		const sampleStep = 1 / this.sampleMult;
		const halfSampleStep = sampleStep / 2;
		const sampleDiv = this.sampleMult * this.sampleMult;

		for (let channelNum = 0; channelNum < this.vecData.length; channelNum++) {

			const channel = this.vecData[channelNum];

			//skip if channel is empty
			if (channel.lines.length == 0 && channel.polygons.length == 0) {
				continue;
			}

			for (let x = 0; x < width; x++) { //for every pixel...
				for (let y = 0; y < height; y++) {

					let collector = 0;

					for (let i = 0; i < this.sampleMult; i++) { //for every sample...
						for (let j = 0; j < this.sampleMult; j++) {

							const point: PointLike = {
								x: startX + x + i * sampleStep + halfSampleStep,
								y: startY + y + j * sampleStep + halfSampleStep
							};

							let closest = Number.POSITIVE_INFINITY;

							for (const line of channel.lines) {
								const dist = SDF.lineDistance(point, line);
								closest = Math.min(closest, dist);
							}

							//TODO: polygons here

							//subtract, cause sdf typically have brightest colors inside of shapes
							//while here it's the opposite since the distance is negative inside of them
							collector -= closest;
						}
					}

					collector /= sampleDiv;
					collector = Math.max(-this.spread, collector); //clamp to [-spread; spread]
					collector = Math.min(this.spread, collector);
					collector = Math.round(255 * (collector + this.spread) / (2 * this.spread)); //map to [0, 255]

					imgData.data[(y * width + x) * 4 + channelNum] = collector;
					imgData.data[(y * width + x) * 4 + 3] = 255; //TODO: sets alpha to 255, remove later
				}
			}
		}

		ctx.putImageData(imgData, 0, 0);
		return canvas;
	}
}