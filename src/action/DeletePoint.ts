class DeletePoint implements Action {
	readonly description: Array<ActionKeyWord>;
	readonly layerNum: number;
	private pointNum: number;
	private point: Point;
	private deletedLines: Array<{ line: Line, i: number }> = []; //also store their position in array to preserve order when undoing

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
		for (let i = 0; i < layer.lines.length; i++) {
			const line = layer.lines[i];

			if (line.from == this.pointNum || line.to == this.pointNum) {
				this.deletedLines.push({ line, i });
			} else {
				//decrement line end point by 1 since removal of point shifted everything by -1
				if (line.from > this.pointNum) {
					line.from--;
				}
				if (line.to > this.pointNum) {
					line.to--;
				}
				newLines.push(line);
			}
		}

		ctx.layers[ctx.activeLayer] = { lines: newLines, points: layer.points.slice(0) };
		ctx.setLayers(ctx.layers.slice(0));
	}

	public undo(ctx: AppContextProps) {
		const layer = ctx.layers[ctx.activeLayer];

		//put the point back
		layer.points.splice(this.pointNum, 0, this.point);

		const newLines: Array<Line> = [];
		let i = 0, j = 0;
		for (let k = 0; k < layer.lines.length + this.deletedLines.length; k++) {
			const line = layer.lines[i];
			const deletedLine = this.deletedLines[j];

			if (deletedLine?.i == k) {
				//if reached position where current deleted line was, restore it
				newLines.push(deletedLine.line);
				j++;
			} else {
				//otherwise just restore line endpoints
				if (line.from >= this.pointNum) {
					line.from++;
				}
				if (line.to >= this.pointNum) {
					line.to++;
				}

				newLines.push(line);
				i++;
			}
		}

		ctx.layers[ctx.activeLayer] = { lines: newLines, points: layer.points.slice(0) };
		ctx.setLayers(ctx.layers.slice(0));
	}
}
