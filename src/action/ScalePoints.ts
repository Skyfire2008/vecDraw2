namespace action {

	export class ScalePoints implements Action {
		readonly description: Array<ActionKeyWord>;
		readonly layerNum: number;
		private prevPositions: Map<number, math.Point>;
		private nextPositions: Map<number, math.Point>;

		constructor(layerNum: number, prevPositions: Map<number, math.Point>, nextPositions: Map<number, math.Point>) {
			this.layerNum = layerNum;
			this.prevPositions = prevPositions;
			this.nextPositions = nextPositions;
			this.description = [`Layer ${layerNum}: scaled selection`];
		}

		public do(ctx: ui.AppContextProps) {
			const layer = ctx.layers[this.layerNum];

			for (const [num, point] of this.nextPositions) {
				layer.points[num] = point;
			}

			ctx.layers[ctx.activeLayer] = { lines: layer.lines, polygons: layer.polygons, points: layer.points };
			ctx.setLayers(ctx.layers.slice(0));
		}

		public undo(ctx: ui.AppContextProps) {
			const layer = ctx.layers[this.layerNum];

			for (const [num, point] of this.prevPositions) {
				layer.points[num] = point;
			}

			ctx.layers[ctx.activeLayer] = { lines: layer.lines, polygons: layer.polygons, points: layer.points };
			ctx.setLayers(ctx.layers.slice(0));
		}
	}
}