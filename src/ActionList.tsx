interface Action {
	name: string;
	do();
	undo();
}

interface ActionListProps {
	actions: Array<Action>;
	setActions: (actions: Array<Action>) => void;
}

const ActionList: React.FC<ActionListProps> = ({ actions, setActions }) => {

	const undo = React.useCallback(() => {
		const last = actions.pop();
		if (last != null) {
			last.undo();
			setActions(actions.slice(0));
		}
	}, [actions]);

	return (
		<div>
			<div>Actions</div>
			<div>{actions.map((action) => <div>{action.name}</div>)}</div>
			<div>
				<button onClick={undo}>Undo</button>
			</div>
		</div>
	);
};