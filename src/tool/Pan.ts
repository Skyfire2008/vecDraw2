namespace tool {

	export class Pan implements Tool {
		readonly name = "Pan";
		readonly description = "Move the visible area";
		private active = false;
		private prevPan: math.Point;

		public constructor() { }

		public onMouseDown(e: MyMouseEvent, ctx: ui.AppContextProps) {
			this.active = true;
			this.prevPan = ctx.pan;
		}

		public onMouseMove(e: MyMouseEvent, ctx: ui.AppContextProps) {
			if (this.active) {
				const result = new math.Point(this.prevPan.x + e.delta.x, this.prevPan.y + e.delta.y);
				ctx.setPan(result);
			}
		}

		public onMouseUp(e: MyMouseEvent, ctx: ui.AppContextProps) {
			this.active = false;
		}

		/*public onPointClick(num: number) {
			//do nothing
		}*/

		public onEnable(ctx: ui.AppContextProps) {
			//do nothing
		}

		public onDisable(ctx: ui.AppContextProps) {
			//do nothing
		}
	}
}