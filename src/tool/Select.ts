class Select implements Tool {
	readonly name = "Select";
	private startPos: PointLike;

	constructor() { }

	public onMouseDown(e: MyMouseEvent, ctx: AppContextProps) {
		this.startPos = e.pos;
	}

	public onMouseUp(e: MyMouseEvent, ctx: AppContextProps) {
		this.startPos = null;
		ctx.tempGroup.current.innerHTML = "";
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