class AddPointAction implements Action {

	readonly description: Array<ActionKeyWord>;
	readonly layerNum: number;
	private num: number;

	constructor(layer: number, num: number) {
		this.description = ["Added point ", { pointNum: num }, ` on layer ${layer}`];
		this.layerNum = layer;
		this.num = num;
	}

	public do(ctx: AppContextProps) {
		//do nothing
	}

	public undo(ctx: AppContextProps) {
		const layer = ctx.layers[this.layerNum];

		if (AddLine.isAddLine(ctx.tool)) {
			if (ctx.tool.selector.getActivePoint() == this.num) {
				ctx.tool.selector.setActivePoint(-1);
			}
		}

		//INFO: this doesn't update react state and relies on components needing layer data to update
		ctx.selection.delete(this.num);

		const newPoints = layer.points.slice(0, layer.points.length - 1);
		ctx.layers[this.layerNum] = { points: newPoints, lines: layer.lines };
		ctx.setLayers(ctx.layers.slice(0));
	}
}