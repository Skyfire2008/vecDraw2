namespace action {

	//TODO: update for polygons
	export class CutLine implements Action {

		readonly description: Array<ActionKeyWord>;
		readonly layerNum: number;
		private cuts: Array<tool.CutType>;

		constructor(layerNum: number, cuts: Array<tool.CutType>) {
			this.layerNum = layerNum;
			this.cuts = cuts;
			this.description = ["cut!"];
		}

		public do(ctx: ui.AppContextProps): void {
			const layer = ctx.layers[this.layerNum];

			for (const cut of this.cuts) {
				const pointNum = layer.points.push(cut.point) - 1;
				const line = layer.lines[cut.lineNum];
				const temp = line.to;
				layer.lines[cut.lineNum].to = pointNum;
				layer.lines.push({ from: pointNum, to: temp, color: line.color, thickness: line.thickness });
			}
			ctx.layers[ctx.activeLayer] = { points: layer.points, polygons: layer.polygons, lines: layer.lines };
			ctx.setLayers(ctx.layers.slice(0));
		}

		public undo(ctx: ui.AppContextProps): void {
			const layer = ctx.layers[this.layerNum];

			//INFO: works under the assumption that new points and lines are appended
			const points = layer.points.slice(0, layer.points.length - this.cuts.length);
			let lines = layer.lines;

			for (let i = 0; i < this.cuts.length; i++) {
				const cut = this.cuts[i];
				lines[cut.lineNum].to = lines[lines.length - this.cuts.length + i].to;
			}
			lines = lines.slice(0, layer.lines.length - this.cuts.length);

			ctx.layers[this.layerNum] = { points, polygons: layer.polygons, lines };
			ctx.setLayers(ctx.layers.slice(0));
		}
	}
}