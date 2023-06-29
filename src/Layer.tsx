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

const Layer: React.FC<LayerData> = ({ lines, points }) => {
	return (
		<g>{lines.map((line, i) =>
			<line
				key={i}
				strokeWidth={line.thickness}
				stroke={line.color}
				x1={points[line.from].x}
				y1={points[line.from].y}
				x2={points[line.to].x}
				y2={points[line.to].y}>
			</line>)}
		</g>
	);
};