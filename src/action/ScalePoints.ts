class ScalePoints implements Action {
	readonly description: Array<ActionKeyWord>;
	readonly layerNum: number;
	private prevPositions: Map<number, Point>;
	private nextPositions: Map<number, Point>;

	constructor(layerNum: number, prevPositions: Map<number, Point>, nextPositions: Map<number, Point>) {
		this.layerNum = layerNum;
		this.prevPositions = prevPositions;
		this.nextPositions = nextPositions;
		this.description = [`Layer ${layerNum}: scaled selection`];
	}

	public do(ctx: AppContextProps) {
		const layer = ctx.layers[this.layerNum];

		for (const [num, point] of this.nextPositions) {
			layer.points[num] = point;
		}

		ctx.layers[ctx.activeLayer] = { lines: layer.lines, points: layer.points };
		ctx.setLayers(ctx.layers.slice(0));
	}

	public undo(ctx: AppContextProps) {
		const layer = ctx.layers[this.layerNum];

		for (const [num, point] of this.prevPositions) {
			layer.points[num] = point;
		}

		ctx.layers[ctx.activeLayer] = { lines: layer.lines, points: layer.points };
		ctx.setLayers(ctx.layers.slice(0));
	}
}