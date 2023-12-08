namespace action {

	export class MovePoint implements Action {
		readonly description: Array<ActionKeyWord>;
		readonly layerNum: number;
		private point: number;
		private pos: math.Point;
		private prevPos: math.Point;

		constructor(layerNum: number, point: number, pos: math.Point, prevPos: math.Point) {
			this.layerNum = layerNum;
			this.point = point;
			this.pos = pos;
			this.prevPos = prevPos;
			this.description = ["Moved point ", { pointNum: point }, ` to position (${pos.x}, ${pos.y})`];
		}

		public do(ctx: ui.AppContextProps) {
			const layer = ctx.layers[this.layerNum];

			layer.points[this.point] = this.pos;
			ctx.layers[this.layerNum] = { points: layer.points.slice(0), polygons: layer.polygons, lines: layer.lines };
			ctx.setLayers(ctx.layers.slice(0));
		}

		public undo(ctx: ui.AppContextProps) {
			const layer = ctx.layers[this.layerNum];

			layer.points[this.point] = this.prevPos;
			ctx.layers[this.layerNum] = { points: layer.points.slice(0), polygons: layer.polygons, lines: layer.lines };
			ctx.setLayers(ctx.layers.slice(0));
		}
	}
}