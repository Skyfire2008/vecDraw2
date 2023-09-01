class Move implements Tool {

	readonly name = "Move";
	private movedIndex = -1;
	private originalPoint: Point = null;

	constructor() { }

	public onMouseDown(e: MyMouseEvent, ctx: AppContextProps) {
		const layer = ctx.layers[ctx.activeLayer];

		this.movedIndex = layer.points.findIndex((p) => Point.equals(p, e.gridPos));
		if (this.movedIndex > -1) {
			this.originalPoint = layer.points[this.movedIndex];
		}
	}

	public onMouseMove(e: MyMouseEvent, ctx: AppContextProps) {
		if (this.movedIndex > -1) {
			const layer = ctx.layers[ctx.activeLayer];

			layer.points[this.movedIndex] = e.gridPos;
			ctx.layers[ctx.activeLayer] = { points: layer.points.slice(0), lines: layer.lines };
			ctx.setLayers(ctx.layers.slice(0))
		}
	}

	public onMouseUp(e: MyMouseEvent, ctx: AppContextProps) {
		ctx.addAction(new MovePoint(ctx.activeLayer, this.movedIndex, ctx.layers[ctx.activeLayer].points[this.movedIndex], this.originalPoint));
		this.movedIndex = -1;
		//TODO: create action that also checks if point overlaps with another one andd merges them if required

	}

	public onEnable(ctx: AppContextProps) {
	}

	public onDisable(ctx: AppContextProps) { }
}