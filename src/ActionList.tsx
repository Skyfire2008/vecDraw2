interface Action {
	name: string;
	do(ctx: AppContextProps): void;
	undo(ctx: AppContextProps): void;
}

interface ActionListProps {
	actions: Array<Action>;
	setActions: (actions: Array<Action>) => void;
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
	}, [actions]);

	return (
		<div>
			<div>Actions</div>
			<div>{actions.map((action, i) => <div key={i}>{action.name}</div>)}</div>
			<div>
				<button onClick={undo}>Undo</button>
			</div>
		</div>
	);
};