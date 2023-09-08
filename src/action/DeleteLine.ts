class DeleteLine implements Action {
	readonly description: Array<ActionKeyWord>;
	readonly layerNum: number;
	private lineNum: number;
	private deletedLine: Line;

	constructor(layerNum: number, lineNum: number) {
		this.layerNum = layerNum;
		this.lineNum = lineNum;
	}

	public do(ctx: AppContextProps): void {
		const layer = ctx.layers[this.layerNum];

		layer.lines.splice(this.lineNum, 1);
		ctx.layers[this.layerNum] = { lines: layer.lines.slice(0), points: layer.points };
		ctx.setLayers(ctx.layers.slice(0));
	}

	public undo(ctx: AppContextProps): void {

	}
}