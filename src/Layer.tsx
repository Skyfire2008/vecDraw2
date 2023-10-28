interface Line {
	from: number;
	to: number;
	thickness: number;
	color: string;
}

interface Polygon {
	points: Array<number>;
	color: string;
}

interface LayerData {
	points: Array<Point>;
	lines: Array<Line>;
	polygons: Array<Polygon>;
}

interface LayerProps {
	layer: LayerData;
	highlight: Highlight;
	pan: PointLike;
	zoom: number;
}

/**
 * Converts shape coordinates to screen
 * @param p original point
 * @param pan screen pan
 * @param zoom screen zoom
 * @param thickness thickness of line attached to point(used to fix aliasing)
 * @returns 
 */
const convertCoords = (p: PointLike, pan: PointLike, zoom: number, thickness: number) => {
	let result = Point.scale(p, zoom);
	result.add(pan);
	let frac = thickness / 2;
	frac = frac - Math.floor(frac);
	result.x = Math.floor(result.x) + frac;
	result.y = Math.floor(result.y) + frac;
	return result;
};

const Layer: React.FC<LayerProps> = React.memo(({ layer, highlight, pan, zoom }) => {

	return (
		<>
			<g>{layer.polygons.map((polygon, i) => {
				let points = "";
				for (const p of polygon.points) {
					const converted = convertCoords(layer.points[p], pan, zoom, 0);
					points += converted.x + "," + converted.y + " ";
				}
				return (<polygon
					key={i}
					points={points}
					style={{ fill: polygon.color }}>
				</polygon>);

			})}</g>
			<g>{layer.lines.map((line, i) => {
				const thickness = line.thickness != 0 ? line.thickness * zoom : 2;
				const from = convertCoords(layer.points[line.from], pan, zoom, thickness);
				const to = convertCoords(layer.points[line.to], pan, zoom, thickness);
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
			<g>{layer.points.map((point, i) => <ControlPoint key={i} num={i} p={point} isHighlighted={highlight?.pointNum == i}></ControlPoint>)}
			</g>
		</>
	);
});