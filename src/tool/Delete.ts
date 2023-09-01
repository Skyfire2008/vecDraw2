class Delete implements Tool {

	readonly name = "Delete";
	private deletedPoint: number;

	constructor() { }

	public onMouseDown(e: MyMouseEvent, ctx: AppContextProps) { }

	public onMouseMove(e: MyMouseEvent, ctx: AppContextProps) {
		const layer = ctx.layers[ctx.activeLayer];

		this.deletedPoint = layer.points.findIndex((p) => Point.equals(p, e.gridPos));
		if (this.deletedPoint > -1) {
			const pos = convertCoords(e.gridPos, ctx.pan, ctx.zoom, 0);
			ctx.tempGroup.current.innerHTML = `
				<line class="point" stroke-linecap="round" stroke-width="2" stroke="red" x1=${pos.x - 5} y1=${pos.y - 5} x2=${pos.x + 5} y2=${pos.y + 5}></line>
				<line class="point" stroke-linecap="round" stroke-width="2" stroke="red" x1=${pos.x + 5} y1=${pos.y - 5} x2=${pos.x - 5} y2=${pos.y + 5}></line>
			`;
		} else {
			ctx.tempGroup.current.innerHTML = "";
		}
	}

	public onMouseUp(e: MyMouseEvent, ctx: AppContextProps) {
		if (this.deletedPoint > -1) {
			ctx.addAction(new DeletePoint(ctx.activeLayer, this.deletedPoint, ctx.layers[ctx.activeLayer].points[this.deletedPoint]));
		}
		ctx.tempGroup.current.innerHTML = "";
	}

	public onEnable(ctx: AppContextProps) { }

	public onDisable(ctx: AppContextProps) { }
}
