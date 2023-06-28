class Pan implements Tool {

	private active = false;
	private prevPan: Point;

	public constructor() { }

	public onMouseDown(e: MyMouseEvent, ctx: AppContextProps) {
		this.active = true;
		this.prevPan = ctx.pan;
	}

	public onMouseMove(e: MyMouseEvent, ctx: AppContextProps) {
		if (this.active) {
			const result = new Point(this.prevPan.x + e.delta.x, this.prevPan.y + e.delta.y);
			ctx.setPan(result);
		}
	}

	public onMouseUp(e: MyMouseEvent, ctx: AppContextProps) {
		this.active = false;
	}
}