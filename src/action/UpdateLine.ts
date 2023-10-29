class UpdateLineAction implements Action {

	readonly description: Array<ActionKeyWord>;
	readonly layerNum: number;
	private lineNum: number;
	private prevThickness: number;
	private prevColor: string;
	private thickness: number;
	private color: string;

	constructor(layer: number, lineNum: number, thickness: number, color: string) {
		this.layerNum = layer;
		this.lineNum = lineNum;
		this.thickness = thickness;
		this.color = color;

		this.description = [" Updated color and thickness of line ", { lineNum }, ` on layer ${layer} to ${color} and ${thickness}`];
	}

	public do(ctx: AppContextProps) {
		const layer = ctx.layers[this.layerNum];
		const line = layer.lines[this.lineNum];
		this.prevThickness = line.thickness;
		this.prevColor = line.color;

		line.thickness = this.thickness;
		line.color = this.color;

		const newLayers = ctx.layers.slice(0);
		newLayers[this.layerNum] = Object.assign({}, layer);
		ctx.setLayers(ctx.layers.slice(0));
	}

	public undo(ctx: AppContextProps) {
		const layer = ctx.layers[this.layerNum];
		layer.lines[this.lineNum].thickness = this.prevThickness;
		layer.lines[this.lineNum].color = this.prevColor;

		const newLayers = ctx.layers.slice(0);
		newLayers[this.layerNum] = Object.assign({}, layer);
		ctx.setLayers(newLayers);
	}
}