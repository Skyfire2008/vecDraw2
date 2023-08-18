interface Action {
	name: string;
	do(ctx: AppContextProps): void;
	undo(ctx: AppContextProps): void;
}

interface ActionListProps {
	actions: Array<Action>;
	setActions: (actions: Array<Action>) => void;
}

class UpdateLineAction implements Action {

	readonly name: string;
	private layer: number;
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

		this.name = `Updated color and thickness of line ${lineNum} on layer ${layer} to ${color} and ${thickness}`;
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

class AddPointAction implements Action {

	readonly name: string;
	private layer: number;
	private num: number;

	constructor(layer: number, num: number) {
		this.name = `Added point ${num} on layer ${layer}`;
		this.layer = layer;
		this.num = num;
	}

	public do(ctx: AppContextProps) {
		//do nothing
	}

	public undo(ctx: AppContextProps) {
		const layer = ctx.layers[this.layer];
		layer.points.pop();

		if (AddLine.isAddLine(ctx.tool)) {
			if (ctx.tool.activePoint == this.num) {
				ctx.tool.activePoint = layer.points.length - 1;
			}
		}

		ctx.setLayers(ctx.layers.slice(0));
	}
}

class AddLineAction implements Action {

	readonly name: string;
	private layer: number;
	private from: number;
	private to: number;
	private isPointNew: boolean;

	constructor(layer: number, from: number, to: number, isPointNew: boolean) {
		this.name = `Connected points ${from} and ${to} on layer ${layer}`;
		this.layer = layer;
		this.from = from;
		this.to = to;
		this.isPointNew = isPointNew;
	}

	public do(ctx: AppContextProps) {
		//do nothing
	}

	//TODO: probably only need to pop last point and last line
	public undo(ctx: AppContextProps) {
		const layer = ctx.layers[this.layer];
		if (this.isPointNew) {
			layer.points.pop();

			if (AddLine.isAddLine(ctx.tool)) {
				if (ctx.tool.activePoint == this.to) {
					ctx.tool.activePoint = layer.points.length - 1;
				}
			}
		}
		layer.lines.pop();


		ctx.setLayers(ctx.layers.slice(0));
	}
}

const ActionList: React.FC<ActionListProps> = ({ actions, setActions }) => {
	const ctx = React.useContext(AppContext);

	const undo = React.useCallback(() => {
		const last = actions.pop();
		if (last != null) {
			last.undo(ctx);
			setActions(actions.slice(0));
		}
	}, [actions, ctx]);

	return (
		<div>
			<div>
				<div>Actions:</div>
				<button onClick={undo}>Undo</button>
			</div>
			<div>{actions.map((action, i) => <div key={i}>{action.name}</div>)}</div>
		</div>
	);
};