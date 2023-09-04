class Delete implements Tool {

	readonly name = "Delete";
	private deletedPoint: number;
	private pointHover = false;

	constructor() { }

	public onMouseDown(e: MyMouseEvent, ctx: AppContextProps) { }

	public onMouseMove(e: MyMouseEvent, ctx: AppContextProps) {
		const layer = ctx.layers[ctx.activeLayer];

		let pos: Point = null;
		if (this.pointHover) {
			pos = convertCoords(layer.points[this.deletedPoint], ctx.pan, ctx.zoom, 0);
		} else {
			this.deletedPoint = layer.points.findIndex((p) => Point.equals(p, e.gridPos));
			if (this.deletedPoint > -1) {
				pos = convertCoords(e.gridPos, ctx.pan, ctx.zoom, 0);
			}
		}

		if (pos != null) {
			ctx.tempGroup.current.innerHTML = `
				<line class="no-mouse-events" stroke-linecap="round" stroke-width="4" stroke="red" x1=${pos.x - 7.5} y1=${pos.y - 7.5} x2=${pos.x + 7.5} y2=${pos.y + 7.5}></line>
				<line class="no-mouse-events" stroke-linecap="round" stroke-width="4" stroke="red" x1=${pos.x + 7.5} y1=${pos.y - 7.5} x2=${pos.x - 7.5} y2=${pos.y + 7.5}></line>
				<line class="no-mouse-events" stroke-linecap="round" stroke-width="2" stroke="white" x1=${pos.x - 5} y1=${pos.y - 5} x2=${pos.x + 5} y2=${pos.y + 5}></line>
				<line class="no-mouse-events" stroke-linecap="round" stroke-width="2" stroke="white" x1=${pos.x + 5} y1=${pos.y - 5} x2=${pos.x - 5} y2=${pos.y + 5}></line>
			`;
		} else {
			ctx.tempGroup.current.innerHTML = "";
		}
	}

	public onMouseUp(e: MyMouseEvent, ctx: AppContextProps) {
		if (this.deletedPoint > -1) {
			ctx.addAction(new DeletePoint(ctx.activeLayer, this.deletedPoint, ctx.layers[ctx.activeLayer].points[this.deletedPoint]));
			this.pointHover = false;
			this.deletedPoint = -1;
		}
		ctx.tempGroup.current.innerHTML = "";
	}

	public onPointEnter(num: number, ctx: AppContextProps) {
		this.deletedPoint = num;
		this.pointHover = true;
	}

	public onPointLeave(num: number, ctx: AppContextProps) {
		this.deletedPoint = -1;
		this.pointHover = false;
	}

	public onEnable(ctx: AppContextProps) { }

	public onDisable(ctx: AppContextProps) { }
}
