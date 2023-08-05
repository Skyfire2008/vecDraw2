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

const convertCoords = (p: PointLike, pan: PointLike, zoom: number, thickness: number) => {
	let result = Point.scale(p, zoom);
	result.add(pan);
	let frac = thickness / 2;
	frac = frac - Math.floor(frac);
	result.x = Math.floor(result.x) + frac;
	result.y = Math.floor(result.y) + frac;
	return result;
};

const Layer: React.FC<LayerData> = ({ lines, points }) => {
	const ctx = React.useContext(AppContext);

	return (
		<>
			<g>{lines.map((line, i) => {
				const thickness = line.thickness != 0 ? line.thickness : 2;
				const from = convertCoords(points[line.from], ctx.pan, ctx.zoom, thickness);
				const to = convertCoords(points[line.to], ctx.pan, ctx.zoom, thickness);
				return (
					<line
						key={i}
						strokeWidth={thickness}
						strokeLinecap="round"
						vectorEffect={line.thickness != 0 ? null : "non-scaling-stroke"}
						stroke={line.color}
						x1={from.x}
						y1={from.y}
						x2={to.x}
						y2={to.y}>
					</line>
				);
			})}
			</g>
			<g>{points.map((point, i) => <ControlPoint key={i} num={i} p={point}></ControlPoint>)}
			</g>
		</>
	);
};