class DeletePoint implements Action {
	readonly description: Array<ActionKeyWord>;
	readonly layerNum: number;
	private pointNum: number;
	private point: Point;
	private deletedLines: Array<Line> = [];

	constructor(layerNum: number, pointNum: number, point: Point) {
		this.layerNum = layerNum;
		this.pointNum = pointNum;
		this.point = point;
		this.description = ["Removed point ", { pointNum }];
	}

	public do(ctx: AppContextProps) {
		const layer = ctx.layers[ctx.activeLayer];

		layer.points.splice(this.pointNum, 1);
		const newLines: Array<Line> = [];
		for (const line of layer.lines) {
			if (line.from == this.pointNum || line.to == this.pointNum) {
				this.deletedLines.push(line);
			} else {
				newLines.push(line);
			}
		}

		ctx.layers[ctx.activeLayer] = { lines: newLines, points: layer.points.slice(0) };
		ctx.setLayers(ctx.layers.slice(0));
	}

	public undo(ctx: AppContextProps) {
		const layer = ctx.layers[ctx.activeLayer];

		layer.points.splice(this.pointNum, 0, this.point);
		for (const line of this.deletedLines) {
			layer.lines.push(line);
		}

		ctx.layers[ctx.activeLayer] = { lines: layer.lines.slice(0), points: layer.points.slice(0) };
		ctx.setLayers(ctx.layers.slice(0));
	}
}