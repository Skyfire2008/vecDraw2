interface ControlPointProps {
	num: number;
	p: Point;
}

const ControlPoint: React.FC<ControlPointProps> = ({ num, p }) => {
	const ctx = React.useContext(AppContext);

	const pos = convertCoords(p, ctx.pan, ctx.zoom, 1);

	const onClick = (e: React.MouseEvent) => {
		ctx.setActivePoint(num);
	};

	return (
		<rect className="point" x={pos.x} y={pos.y} width="5" height="5" stroke="white" fill="#00000000" onClick={onClick}></rect>
	);
};