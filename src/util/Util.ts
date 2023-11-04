interface ShapeData {
	ver: number;
	layers: Array<{ points: Array<PointLike>, lines: Array<Line>, polygons: Array<Polygon> }>;
}

interface OldPoint {
	x: number;
	y: number;
	color: string;
}

interface OldLine {
	from: number;
	to: number;
}

interface OldShapeData {
	points: Array<OldPoint>;
	lines: Array<OldLine>;
}

const isOldFormat = (data: ShapeData | OldShapeData): data is OldShapeData => {
	return (data as any).layers == undefined && (data as any).points != undefined && (data as any).lines != undefined;
}

const loadShape = (shapeString: string): Array<LayerData> => {
	const json: ShapeData | OldShapeData = JSON.parse(shapeString);
	if (isOldFormat(json)) {
		const points: Array<Point> = json.points.map((p) => { return new Point(p.x, p.y) });
		const lines: Array<Line> = json.lines.map((l) => {
			return { from: l.from, to: l.to, thickness: 0, color: json.points[l.from].color };
		});
		return [{ points, lines, polygons: [] }];
	} else {
		return json.layers.map((layer) => {
			return { lines: layer.lines, polygons: layer.polygons ? layer.polygons : [], points: layer.points.map((p) => new Point(p.x, p.y)) };
		})
	}
}

const drawOntoCanvas = (canvas: HTMLCanvasElement, layers: Array<LayerData>, bgColor: string, scale: number) => {

	//scale the fucking layers first!!!
	const scaledLayers: Array<LayerData> = [];
	for (const layer of layers) {
		const newLayer: LayerData = { points: [], lines: [], polygons: [] };
		for (const line of layer.lines) {
			newLayer.lines.push(Object.assign({}, line, { thickness: line.thickness * scale }));
		}

		for (const point of layer.points) {
			newLayer.points.push(Point.scale(point, scale));
		}
		scaledLayers.push(newLayer);
	}

	let left = Number.POSITIVE_INFINITY;
	let top = Number.POSITIVE_INFINITY;
	let right = Number.NEGATIVE_INFINITY;
	let bottom = Number.NEGATIVE_INFINITY;

	for (const layer of scaledLayers) {
		for (const line of layer.lines) {
			const halfThickness = line.thickness > 0 ? Math.ceil(line.thickness / 2) : 1;

			const from = layer.points[line.from];
			const to = layer.points[line.to];

			const minX = Math.min(from.x - halfThickness, to.x - halfThickness);
			const maxX = Math.max(from.x + halfThickness, to.x + halfThickness);
			const minY = Math.min(from.y - halfThickness, to.y - halfThickness);
			const maxY = Math.max(from.y + halfThickness, to.y + halfThickness);

			left = Math.min(left, minX);
			right = Math.max(right, maxX);
			top = Math.min(top, minY);
			bottom = Math.max(bottom, maxY);
		}
	}

	canvas.width = right - left;
	canvas.height = bottom - top;

	const ctx = canvas.getContext("2d");
	ctx.lineJoin = "round";
	ctx.lineCap = "round";
	ctx.fillStyle = bgColor;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	//TODO: move into a separate module so this can be reused by preview
	const convertPoint = (p: Point, thickness: number) => {
		const result = Point.subtract(p, { x: left, y: top });
		let frac = thickness / 2;
		frac -= Math.floor(frac);

		result.x = Math.floor(result.x) + frac;
		result.y = Math.floor(result.y) + frac;
		return result;
	};

	for (const layer of scaledLayers) {
		for (const line of layer.lines) {
			const thickness = line.thickness > 0 ? line.thickness : 1;
			const from = convertPoint(layer.points[line.from], thickness);
			const to = convertPoint(layer.points[line.to], thickness);

			ctx.beginPath();
			ctx.moveTo(from.x, from.y);
			ctx.strokeStyle = line.color;
			ctx.lineWidth = thickness;
			ctx.lineTo(to.x, to.y);
			ctx.stroke();
		}
	}
}

const segmentIntersection = (p0: PointLike, p1: PointLike, q0: PointLike, q1: PointLike) => {
	const v = Point.subtract(p1, p0);
	const u = Point.subtract(q1, q0);

	const bar = u.x * v.y - v.x * u.y;
	const foo = v.x * (q0.y - p0.y) + v.y * (p0.x - q0.x);
	const s = foo / bar;
	if (s > 0 && s < 1) {
		if (v.x != 0) {
			const t = (u.x * s + q0.x - p0.x) / v.x;
			if (t > 0 && t < 1) {
				const result = Point.scale(v, t);
				result.add(p0);
				return result;
			}
		} else { //special case for p0.x==p1.x cause calculating t causes division by 0 
			const result = Point.scale(u, s);
			result.add(q0);
			if (p0.y < p1.y) {
				if (p0.y < result.y && result.y < p1.y) {
					return result;
				}
			} else {
				if (p1.y < result.y && result.y < p0.y) {
					return result;
				}
			}
		}
	}

	return null;
}