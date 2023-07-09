interface Line {
	from: number;
	to: number;
	thickness: number;
	color: string;
}

interface LayerData {
	points: Array<Point>;
	lines: Array<Line>;
}

/*const PointRect:React.FC<Point>=({x, y})=>{

};*/

const Layer: React.FC<LayerData> = ({ lines, points }) => {
	const ctx = React.useContext(AppContext);
	return (
		<>
			<g>{lines.map((line, i) =>
				<line
					key={i}
					strokeWidth={line.thickness != 0 ? line.thickness : 2}
					strokeLinecap="round"
					vectorEffect={line.thickness != 0 ? null : "non-scaling-stroke"}
					stroke={line.color}
					x1={points[line.from].x}
					y1={points[line.from].y}
					x2={points[line.to].x}
					y2={points[line.to].y}>
				</line>)}
			</g>
			<g>{points.map((point, i) => <use key={i} href="#pointRect" transform={`translate(${point.x}, ${point.y}), scale(${1 / ctx.zoom})`}></use>)}</g>
		</>
	);
};