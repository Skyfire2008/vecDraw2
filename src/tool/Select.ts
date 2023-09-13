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
		// if start shape pos not set, skip
		if (this.startShapePos == null) {
			return;
		}

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

		//ctrl - add, shift - remove
		let selection = new Set<number>();
		if (e.ctrlHeld || e.shiftHeld) {
			for (const item of ctx.selection) {
				selection.add(item);
			}
		}

		const points = ctx.layers[ctx.activeLayer].points;
		for (let i = 0; i < points.length; i++) {
			const point = points[i];

			if (point.x > x0 && point.x <= x1 && point.y > y0 && point.y <= y1) {
				if (!e.shiftHeld) {
					selection.add(i);
				} else {
					selection.delete(i);
				}
			}
		}
		ctx.setSelection(selection);

		//cleanup
		this.startPos = null;
		ctx.tempGroup.current.innerHTML = "";
		this.startShapePos = null;
	}

	public onMouseMove(e: MyMouseEvent, ctx: AppContextProps) {
		if (this.startPos != null) {
			const x = Math.floor(Math.min(this.startPos.x, e.pos.x)) + 0.5;
			const width = Math.abs(e.pos.x - this.startPos.x);
			const y = Math.floor(Math.min(this.startPos.y, e.pos.y)) + 0.5;
			const height = Math.abs(e.pos.y - this.startPos.y);

			ctx.tempGroup.current.innerHTML = `
			<rect x=${x} y=${y} width=${width} height=${height} stroke-width="3" stroke-linecap="round" stroke="black" fill="none" stroke-dasharray="10 6"></rect>
			<rect x=${x} y=${y} width=${width} height=${height} stroke-width="1" stroke-linecap="round" stroke="white" fill="none" stroke-dasharray="10 6"></rect>`;
		}
	}

	public onPointClick(num: number, ctx: AppContextProps) { }

	public onEnable(ctx: AppContextProps) { }

	public onDisable(ctx: AppContextProps) {
		this.startPos = null;
		ctx.tempGroup.current.innerHTML = "";
		ctx.setSelection(new Set<number>());
	}
}