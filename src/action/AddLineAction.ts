class AddLineAction implements Action {

	private static isPoint(p: Point | number): p is Point {
		return p instanceof Point;
	}

	readonly description: Array<ActionKeyWord>;
	readonly layerNum: number;
	private from: number;
	private to: number | Point;
	private thickness: number;
	private color: string;

	constructor(layer: number, from: number, to: number | Point, thickness: number, color: string) {
		//TODO: pointnum
		this.description = ["Connected points ", { pointNum: from }, " and ", { pointNum: 0 }, ` on layer ${layer}`];
		this.layerNum = layer;
		this.from = from;
		this.to = to;
		this.thickness = thickness;
		this.color = color;
	}

	public do(ctx: AppContextProps) {
		const layer = ctx.layers[this.layerNum];

		//if connecting existing points, just add line, otherwise add point also
		let toNum: number;
		if (AddLineAction.isPoint(this.to)) {
			toNum = layer.points.length;
			layer.points.push(this.to);
		} else {
			toNum = this.to;
		}

		layer.lines.push({ from: this.from, to: toNum, color: this.color, thickness: this.thickness });

		const newLayers = ctx.layers.slice(0);
		newLayers[this.layerNum] = Object.assign({}, layer);
		ctx.setLayers(newLayers);
	}

	//TODO: probably only need to pop last point and last line
	public undo(ctx: AppContextProps) {
		const layer = ctx.layers[this.layerNum];

		//if connected to new point, remove it and set addLineTool active point
		if (AddLineAction.isPoint(this.to)) {
			const toNum = layer.points.length - 1;
			layer.points.pop();

			//INFO: this doesn't update react state and relies on components needing layer data to update
			ctx.selection.delete(toNum);

			if (AddLine.isAddLine(ctx.tool)) {
				if (ctx.tool.selector.getActivePoint() == toNum) {
					ctx.tool.selector.setActivePoint(-1);
				}
			}
		}

		const newLines = layer.lines.slice(0, layer.lines.length - 1);
		ctx.layers[this.layerNum] = { points: layer.points, polygons: layer.polygons, lines: newLines };
		ctx.setLayers(ctx.layers.slice(0));
	}
}