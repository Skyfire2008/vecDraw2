namespace action {

	//TODO: when merging, remove self-loops, redundant lines
	class MergePoints implements Action {
		readonly description: Array<ActionKeyWord>;
		readonly layerNum: number;
		private origin: number;
		private originalPoint: math.Point;
		private target: number;
		private linesToRestore: Array<number> = [];

		constructor(layerNum: number, origin: number, target: number, originalPoint: math.Point) {
			this.layerNum = layerNum;
			this.origin = Math.max(origin, target);
			this.target = Math.min(origin, target);
			this.originalPoint = originalPoint;
			this.description = [`Merged point ${origin} into `, { pointNum: target }];
		}

		public do(ctx: ui.AppContextProps) {
			const layer = ctx.layers[ctx.activeLayer];

			layer.points.splice(this.origin, 1);

			for (let i = 0; i < layer.lines.length; i++) {
				const line = layer.lines[i];

				if (line.from == this.origin) {
					line.from = this.target;
					this.linesToRestore.push(i);
				} else if (line.from > this.origin) {
					line.from--;
					this.linesToRestore.push(i);
				}

				if (line.to == this.origin) {
					line.to = this.target;
					this.linesToRestore.push(i);
				} else if (line.to > this.origin) {
					line.to--;
					this.linesToRestore.push(i);
				}
			}
		}

		public undo(ctx: ui.AppContextProps) {

		}
	}
}