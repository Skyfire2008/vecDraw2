interface SdfLayer {
	points: Array<PointLike>;
	lines: Array<Line>;
	polygons: Array<Polygon>;
}

interface SdfLineData {
	vec: Point;
	len: number;
	len2: number;
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

				let point: PointLike = { x: x + startX, y: y + startY };

				let closest = Number.POSITIVE_INFINITY;
				let absClosest = Number.POSITIVE_INFINITY;

				for (let i = 0; i < layer.lines.length; i++) {
					const line = layer.lines[i];
					const distance = lineDistance(point, layer.points[line.from], layer.points[line.to], lineVecs[i], line.thickness);
					const absDistance = Math.abs(distance);

					if (absClosest > absDistance) {
						absClosest = absDistance;
						closest = distance;
					}
				}

				//TODO: for every polygon here...

				closest = Math.trunc(Math.max(128 - closest, 0));
				bytes[(y * width + x) * 4 + channel] = closest;
			}
		}
	}
};