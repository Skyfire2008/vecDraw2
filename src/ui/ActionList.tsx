namespace ui {

	interface ActionListProps {
		actions: Array<action.Action>;
		setActions: (actions: Array<action.Action>) => void;
	}

	interface ActionCompoProps {
		action: action.Action;
		setHighlight: (highlight: Highlight) => void;
	}

	const ActionCompo: React.FC<ActionCompoProps> = ({ action, setHighlight }) => {

		const onMouseLeave = (e: React.MouseEvent<HTMLSpanElement>) => { setHighlight(null) };

		const foobar = (word: action.ActionKeyWord, key: number) => {
			if ((word as any).lineNum != null) {
				return <span key={key} className="action-highlightable" onMouseLeave={onMouseLeave} onMouseEnter={(e) => {
					setHighlight({
						layerNum: action.layerNum,
						lineNum: (word as any).lineNum
					});
				}}>{(word as any).lineNum}</span>;
			} else if ((word as any).pointNum != null) {
				return <span key={key} className="action-highlightable" onMouseLeave={onMouseLeave} onMouseEnter={(e) => {
					setHighlight({
						layerNum: action.layerNum,
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

	export const ActionList: React.FC<ActionListProps> = ({ actions, setActions }) => {
		const ctx = React.useContext(AppContext);

		const undo = React.useCallback(() => {
			const last = actions.pop();
			if (last != null) {
				last.undo(ctx);
				setActions(actions.slice(0));
			}
		}, [actions, ctx]);

		React.useEffect(() => {
			const handler = (e: KeyboardEvent) => {
				if (e.key == "z" && e.ctrlKey) {
					e.preventDefault();
					undo();
				}
			};
			document.addEventListener("keydown", handler);

			return () => document.removeEventListener("keydown", handler);
		}, [undo]);

		return (
			<div>
				<div className="line component-header" style={{ justifyContent: "space-between" }}>
					<div>Actions:</div>
					<button onClick={undo}>Undo</button>
				</div>
				<div className="action-list">{
					actions.map((action, i) => <ActionCompo key={i} action={action} setHighlight={ctx.setHighlight}></ActionCompo>)
				}</div>
			</div>
		);
	};
}