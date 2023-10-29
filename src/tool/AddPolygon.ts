class AddPolygon implements Tool {

	readonly name = "AddPolygon";
	readonly description = "Add a polygon";

	private polygonNum: number;

	constructor() {

	}

	public onMouseDown(e: MyMouseEvent, ctx: AppContextProps) {
	}

	public onMouseMove(e: MyMouseEvent, ctx: AppContextProps) {
	}

	public onMouseUp(e: MyMouseEvent, ctx: AppContextProps) {
	}

	public onPointEnter(num: number, ctx: AppContextProps) {
	}

	public onPointLeave(num: number, ctx: AppContextProps) {
	}

	public onPointClick(num: number, ctx: AppContextProps, ctrlHeld: boolean, shiftHeld: boolean) {
	}

	public onEnable(ctx: AppContextProps) {
		this.polygonNum = ctx.layers[ctx.activeLayer].polygons.length;
	}
}