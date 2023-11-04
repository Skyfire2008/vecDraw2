//TODO: update for polygons
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
		const layer = ctx.layers[this.layerNum];

		const newPointNums: Array<number> = [];
		const newPoints: Array<Point> = [];
		let skip = 0;
		for (let i = 0; i < layer.points.length; i++) {
			const point = layer.points[i];

			if (this.selection.has(i)) {
				this.deletedPoints.push({ num: i, p: point });
				skip++;
			} else {
				newPoints.push(point);
				newPointNums[i] = i - skip;
			}
		}

		const newLines: Array<Line> = [];
		for (let i = 0; i < layer.lines.length; i++) {
			const line = layer.lines[i];

			if (this.selection.has(line.from) || this.selection.has(line.to)) {
				this.deletedLines.push({ num: i, l: line });
			} else {
				const newLine = Object.assign({}, line, { from: newPointNums[line.from], to: newPointNums[line.to] });
				newLines.push(newLine);
			}
		}

		ctx.layers[this.layerNum] = { points: newPoints, polygons: layer.polygons, lines: newLines };
		ctx.setLayers(ctx.layers.slice(0));
		ctx.setSelection(new Set<number>());
	}

	public undo(ctx: AppContextProps): void {
		const layer = ctx.layers[this.layerNum];

		const newPointNums: Array<number> = [];
		const newPoints: Array<Point> = [];
		let delInd = 0;
		let oldInd = 0;
		for (let i = 0; i < layer.points.length + this.deletedPoints.length; i++) {
			const delPoint = this.deletedPoints[delInd];

			if (delPoint?.num == i) {
				newPoints.push(delPoint.p);
				delInd++;
			} else {
				newPoints.push(layer.points[oldInd]);
				newPointNums[oldInd] = i;
				oldInd++;
			}
		}

		const newLines: Array<Line> = [];
		delInd = 0;
		oldInd = 0;
		for (let i = 0; i < layer.lines.length + this.deletedLines.length; i++) {
			const delLine = this.deletedLines[delInd];

			if (delLine?.num == i) {
				newLines.push(delLine.l);
				delInd++;
			} else {
				const line = layer.lines[oldInd];
				const newLine = Object.assign({}, line, { from: newPointNums[line.from], to: newPointNums[line.to] });
				newLines.push(newLine);
				oldInd++;
			}
		}

		ctx.layers[this.layerNum] = { points: newPoints, polygons: layer.polygons, lines: newLines };
		ctx.setLayers(ctx.layers.slice(0));
		ctx.setSelection(this.selection);
	}
}