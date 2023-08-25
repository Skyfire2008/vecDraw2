interface ActionListProps {
	actions: Array<Action>;
	setActions: (actions: Array<Action>) => void;
}

interface ActionCompoProps {
	action: Action;
	setHighlight: (highlight: Highlight) => void;
}

const ActionCompo: React.FC<ActionCompoProps> = ({ action, setHighlight }) => {

	const onMouseLeave = (e: React.MouseEvent<HTMLSpanElement>) => { setHighlight(null) };

	const foobar = (word: ActionKeyWord, key: number) => {
		if ((word as any).lineNum != null) {
			return <span key={key} className="action-highlightable" onMouseLeave={onMouseLeave} onMouseEnter={(e) => {
				setHighlight({
					layerNum: action.layer,
					lineNum: (word as any).lineNum
				});
			}}>{(word as any).lineNum}</span>;
		} else if ((word as any).pointNum != null) {
			return <span key={key} className="action-highlightable" onMouseLeave={onMouseLeave} onMouseEnter={(e) => {
				setHighlight({
					layerNum: action.layer,
					pointNum: (word as any).pointNum
				});
			}}>{(word as any).pointNum}</span>;
		} else {
			return <>{word as string}</>;
		}
	};

	return (
		<div>{action.description.map(foobar)}</div>
	);
};

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
			<div>{actions.map((action, i) => <ActionCompo key={i} action={action} setHighlight={ctx.setHighlight}></ActionCompo>)}</div>
		</div>
	);
};