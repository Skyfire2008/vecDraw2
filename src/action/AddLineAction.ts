class AddLineAction implements Action {

	readonly description: Array<ActionKeyWord>;
	readonly layerNum: number;
	private from: number;
	private to: number;
	private isPointNew: boolean;

	constructor(layer: number, from: number, to: number, isPointNew: boolean) {
		this.description = ["Connected points ", { pointNum: from }, " and ", { pointNum: to }, ` on layer ${layer}`];
		this.layerNum = layer;
		this.from = from;
		this.to = to;
		this.isPointNew = isPointNew;
	}

	public do(ctx: AppContextProps) {
		//do nothing
	}

	//TODO: probably only need to pop last point and last line
	public undo(ctx: AppContextProps) {
		const layer = ctx.layers[this.layerNum];
		if (this.isPointNew) {
			layer.points.pop();

			//INFO: this doesn't update react state and relies on components needing layer data to update
			ctx.selection.delete(this.to);

			if (AddLine.isAddLine(ctx.tool)) {
				if (ctx.tool.selector.getActivePoint() == this.to) {
					ctx.tool.selector.setActivePoint(-1);
				}
			}
		}

		const newLines = layer.lines.slice(0, layer.lines.length - 1);
		ctx.layers[this.layerNum] = { points: layer.points, polygons: layer.polygons, lines: newLines };
		ctx.setLayers(ctx.layers.slice(0));
	}
}