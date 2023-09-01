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

			if (AddLine.isAddLine(ctx.tool)) {
				if (ctx.tool.activePoint == this.to) {
					ctx.tool.activePoint = layer.points.length - 1;
				}
			}
		}

		const newLines = layer.lines.slice(0, layer.lines.length - 1);
		ctx.layers[this.layerNum] = { points: layer.points, lines: newLines };
		ctx.setLayers(ctx.layers.slice(0));
	}
}