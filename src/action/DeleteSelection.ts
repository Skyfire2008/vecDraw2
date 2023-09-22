class DeleteSelection implements Action {
	readonly description: Array<ActionKeyWord>;
	readonly layerNum: number;
	private selection: Set<number>;

	private deletedPoints: Array<{ num: number, p: Point }> = [];
	private deletedLines: Array<{ num: number, l: Line }> = [];

	constructor(layerNum: number, selection: Set<number>) {
		this.layerNum = layerNum;
		this.description = ["Selection deleted"];
		this.selection = selection;
	}

	public do(ctx: AppContextProps): void {
		const layer = ctx.layers[ctx.activeLayer];

		const newPoints: Array<Point> = [];
		for (let i = 0; i < layer.points.length; i++) {
			const point = layer.points[i];

			if (this.selection.has(i)) {
				this.deletedPoints.push({ num: i, p: point });
			} else {
				newPoints.push(point);
			}
		}

		const newLines: Array<Line> = [];
		for (let i = 0; i < layer.lines.length; i++) {
			const line = layer.lines[i];

			if (this.selection.has(line.from) || this.selection.has(line.to)) {
				this.deletedLines.push({ num: i, l: line });
			} else {
				//TODO: all point ids after removed ones get decremented
				newLines.push(line);
			}
		}

		ctx.layers[ctx.activeLayer] = { points: newPoints, lines: newLines };
		ctx.setLayers(ctx.layers.slice(0));
		ctx.setSelection(new Set<number>());
	}

	public undo(ctx: AppContextProps): void {

	}
}