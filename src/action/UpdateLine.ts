class UpdateLineAction implements Action {

	readonly description: Array<ActionKeyWord>;
	readonly layer: number;
	private lineNum: number;
	private prevThickness: number;
	private prevColor: string;
	private thickness: number;
	private color: string;

	constructor(layer: number, lineNum: number, prevThickness: number, prevColor: string, thickness: number, color: string) {
		this.layer = layer;
		this.lineNum = lineNum;
		this.prevThickness = prevThickness;
		this.prevColor = prevColor;
		this.thickness = thickness;
		this.color = color;

		this.description = [" Updated color and thickness of line ", { lineNum }, ` on layer ${layer} to ${color} and ${thickness}`];
	}

	public do(ctx: AppContextProps) {
		//do nothing
	}

	public undo(ctx: AppContextProps) {
		const layer = ctx.layers[this.layer];
		layer.lines[this.lineNum].thickness = this.prevThickness;
		layer.lines[this.lineNum].color = this.prevColor;

		const newLayers = ctx.layers.slice(0);
		newLayers[this.layer] = { lines: layer.lines, points: layer.points };
		ctx.setLayers(newLayers);
	}
}