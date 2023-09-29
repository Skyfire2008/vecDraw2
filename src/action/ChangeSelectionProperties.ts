class ChangeSelectionProperties implements Action {

	readonly description: Array<ActionKeyWord>;
	readonly layerNum: number;
	private selection: Set<number>;
	private thickness: number;
	private color: string;

	private prevLines: Map<number, Line>;

	constructor(layerNum: number, selection: Set<number>, thickness: number, color: string) {
		this.layerNum = layerNum;
		this.selection = selection;
		this.thickness = thickness;
		this.color = color;
		this.description = [`Changed selection properties`];
	}

	public do(ctx: AppContextProps): void {
		const layer = ctx.layers[this.layerNum];

		this.prevLines = new Map<number, Line>();

		for (let i = 0; i < layer.lines.length; i++) {
			const line = layer.lines[i];
			if (this.selection.has(line.from) && this.selection.has(line.to)) {
				this.prevLines.set(i, line);
				layer.lines[i] = {
					from: line.from,
					to: line.to,
					thickness: this.thickness != null ? this.thickness : line.thickness,
					color: this.color != null ? this.color : line.color
				};
			}
		}

		ctx.layers[this.layerNum] = { lines: layer.lines, points: layer.points };
		ctx.setLayers(ctx.layers.slice(0));
	}

	public undo(ctx: AppContextProps): void {
		const layer = ctx.layers[this.layerNum];

		for (const [ind, line] of this.prevLines) {
			layer.lines[ind] = line;
		}

		ctx.layers[this.layerNum] = { lines: layer.lines, points: layer.points };
		ctx.setLayers(ctx.layers.slice(0));
	}
}