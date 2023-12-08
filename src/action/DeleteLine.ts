namespace action {

	export class DeleteLine implements Action {
		readonly description: Array<ActionKeyWord>;
		readonly layerNum: number;
		private lineNum: number;
		private deletedLine: types.Line;

		constructor(layerNum: number, lineNum: number) {
			this.layerNum = layerNum;
			this.lineNum = lineNum;
			this.description = [`Removed line ${lineNum}`];
		}

		public do(ctx: ui.AppContextProps): void {
			const layer = ctx.layers[this.layerNum];

			this.deletedLine = layer.lines.splice(this.lineNum, 1)[0];
			ctx.layers[this.layerNum] = { lines: layer.lines.slice(0), polygons: layer.polygons, points: layer.points };
			ctx.setLayers(ctx.layers.slice(0));
		}

		public undo(ctx: ui.AppContextProps): void {
			const layer = ctx.layers[this.layerNum];

			layer.lines.splice(this.lineNum, 0, this.deletedLine);
			ctx.layers[this.layerNum] = { lines: layer.lines.slice(0), polygons: layer.polygons, points: layer.points };
			ctx.setLayers(ctx.layers.slice(0));
		}
	}
}