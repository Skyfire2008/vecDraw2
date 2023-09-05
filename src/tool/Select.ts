class Select implements Tool {
	readonly name = "Select";
	readonly description = "NOT IMPLEMENTED";
	private startPos: PointLike;
	private startShapePos: PointLike;

	constructor() { }

	public onMouseDown(e: MyMouseEvent, ctx: AppContextProps) {
		this.startPos = e.pos;
		this.startShapePos = e.shapePos;
	}

	public onMouseUp(e: MyMouseEvent, ctx: AppContextProps) {
		this.startPos = null;
		ctx.tempGroup.current.innerHTML = "";

		let x0 = 0;
		let y0 = 0;
		let x1 = 0;
		let y1 = 0;
		if (e.shapePos.x > this.startShapePos.x) {
			x0 = this.startShapePos.x;
			x1 = e.shapePos.x;
		} else {
			x0 = e.shapePos.x;
			x1 = this.startShapePos.x;
		}
		if (e.shapePos.y > this.startShapePos.y) {
			y0 = this.startShapePos.y;
			y1 = e.shapePos.y;
		} else {
			y0 = e.shapePos.y;
			y1 = this.startShapePos.y;
		}

		const selection = new Set<PointLike>();
		for (const point of ctx.layers[ctx.activeLayer].points) {
			if (point.x > x0 && point.x <= x1 && point.y > y0 && point.y <= y1) {
				selection.add(point);
			}
		}
		ctx.setSelection(selection);
	}

	public onMouseMove(e: MyMouseEvent, ctx: AppContextProps) {
		if (this.startPos != null) {
			const x = Math.min(this.startPos.x, e.pos.x);
			const width = Math.abs(e.pos.x - this.startPos.x);
			const y = Math.min(this.startPos.y, e.pos.y);
			const height = Math.abs(e.pos.y - this.startPos.y);

			ctx.tempGroup.current.innerHTML = `<rect x=${x} y=${y} width=${width} height=${height} stroke="white" fill="none"></rect>`;
		}
	}

	public onPointClick(num: number, ctx: AppContextProps) { }

	public onEnable(ctx: AppContextProps) { }

	public onDisable(ctx: AppContextProps) {
		this.startPos = null;
		ctx.tempGroup.current.innerHTML = "";
	}
}