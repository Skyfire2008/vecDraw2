class AddPointAction implements Action {

	readonly description: Array<ActionKeyWord>;
	readonly layer: number;
	private num: number;

	constructor(layer: number, num: number) {
		this.description = ["Added point ", { pointNum: num }, ` on layer ${layer}`];
		this.layer = layer;
		this.num = num;
	}

	public do(ctx: AppContextProps) {
		//do nothing
	}

	public undo(ctx: AppContextProps) {
		const layer = ctx.layers[this.layer];

		if (AddLine.isAddLine(ctx.tool)) {
			if (ctx.tool.activePoint == this.num) {
				ctx.tool.activePoint = layer.points.length - 2;
			}
		}

		const newPoints = layer.points.slice(0, layer.points.length - 1);
		ctx.layers[this.layer] = { points: newPoints, lines: layer.lines };
		ctx.setLayers(ctx.layers.slice(0));
	}
}