interface ShapeData {
	ver: number;
	layers: Array<LayerData>;
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

const loadShape = (shapeString: string): ShapeData => {
	const json: ShapeData | OldShapeData = JSON.parse(shapeString);
	if (isOldFormat(json)) {
		const points: Array<Point> = json.points.map((p) => { return new Point(p.x, p.y) });
		const lines: Array<Line> = json.lines.map((l) => {
			return { from: l.from, to: l.to, thickness: 0, color: json.points[l.from].color };
		});
		return { ver: 1, layers: [{ points, lines }] };
	} else {
		return json;
	}
}