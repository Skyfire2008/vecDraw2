interface ControlPointProps {
	num: number;
	p: Point;
}

const ControlPoint: React.FC<ControlPointProps> = ({ num, p }) => {
	const ctx = React.useContext(AppContext);

	const pos = convertCoords(p, ctx.pan, ctx.zoom, 0);

	const onClick = (e: React.MouseEvent) => {
		ctx.setActivePoint(num);
	};

	return (
		<rect className="point" x={pos.x-2.5} y={pos.y-2.5} width="5" height="5" stroke="white" fill="#00000000" onClick={onClick}></rect>
	);
};