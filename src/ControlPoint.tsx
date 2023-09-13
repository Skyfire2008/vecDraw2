interface ControlPointProps {
	num: number;
	p: Point;
	isHighlighted: boolean;
}

const ControlPoint: React.FC<ControlPointProps> = ({ num, p, isHighlighted }) => {
	const ctx = React.useContext(AppContext);

	const pos = convertCoords(p, ctx.pan, ctx.zoom, 0);

	const isSelected = ctx.selection.has(num) || isHighlighted == true;

	const onClick = (e: React.MouseEvent) => {
		//only stop event propagation if tool has a special method for point click
		if (ctx.tool.onPointClick != null) {
			ctx.tool.onPointClick(num, ctx);
			e.bubbles = false;
			e.stopPropagation();
		}
	};

	///TODO: check if this is active layer???
	const onMouseEnter = (e: React.MouseEvent) => {
		if (ctx.tool.onPointEnter != null) {
			ctx.tool.onPointEnter(num, ctx);
		}
	}

	const onMouseLeave = (e: React.MouseEvent) => {
		if (ctx.tool.onPointLeave != null) {
			ctx.tool.onPointLeave(num, ctx);
		}
	}

	return (
		<g onMouseUp={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
			{isSelected && <>
				<circle cx={pos.x} cy={pos.y} r="14" stroke="black" fill="none"></circle>
				<circle cx={pos.x} cy={pos.y} r="12" stroke="white" fill="none"></circle>
			</>}
			<rect className="point" x={pos.x - 3.5} y={pos.y - 3.5} width="7" height="7" stroke="black" fill="#00000000"></rect>
			<rect className="point" x={pos.x - 2.5} y={pos.y - 2.5} width="5" height="5" stroke="white" fill="none"></rect>
		</g>
	);
};