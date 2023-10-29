class AddPointAction implements Action {

	readonly description: Array<ActionKeyWord>;
	readonly layerNum: number;
	private num: number;
	private point: Point;

	constructor(layer: number, point: Point) {
		//TODO: pointnum
		this.description = ["Added point ", { pointNum: 0 }, ` on layer ${layer}`];
		this.layerNum = layer;
		this.point = point;
	}

	public do(ctx: AppContextProps) {
		const layer = ctx.layers[this.layerNum];

		this.num = layer.points.length;
		layer.points.push(this.point);

		const newLayers = ctx.layers.slice(0);
		newLayers[this.layerNum] = Object.assign({}, layer);
		ctx.setLayers(newLayers);
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
		ctx.layers[this.layerNum] = { points: newPoints, polygons: layer.polygons, lines: layer.lines };
		ctx.setLayers(ctx.layers.slice(0));
	}
}