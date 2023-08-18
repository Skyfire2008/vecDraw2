//TODO: update the preview dimensions every time a new line/point is added
interface PreviewProps {
	layers: Array<LayerData>;
	width: number;
	height: number;
	bgColor: string;
	/*left: number;
	right: number;
	top: number;
	bottom: number;*/
}

const Preview: React.FC<PreviewProps> = ({ layers, width, height, bgColor/*left, right, top, bottom*/ }) => {

	const canvasRef = React.useRef<HTMLCanvasElement>();

	const dimensions = React.useMemo(() => {
		const result = { left: Number.POSITIVE_INFINITY, right: Number.NEGATIVE_INFINITY, top: Number.POSITIVE_INFINITY, bottom: Number.NEGATIVE_INFINITY };

		for (const layer of layers) {
			for (const line of layer.lines) {
				const halfThickness = line.thickness > 0 ? line.thickness / 2 : 1;
				const from = layer.points[line.from];
				const to = layer.points[line.to];

				const minX = Math.min(from.x - halfThickness, to.x - halfThickness);
				const maxX = Math.max(from.x + halfThickness, to.x + halfThickness);
				const minY = Math.min(from.y - halfThickness, to.y - halfThickness);
				const maxY = Math.max(from.y + halfThickness, to.y + halfThickness);

				result.left = Math.min(result.left, minX);
				result.right = Math.max(result.right, maxX);
				result.top = Math.min(result.top, minY);
				result.bottom = Math.max(result.bottom, maxY);
			}
		}

		return result;
	}, [layers]);

	const scale = Math.min(1, width / (dimensions.right - dimensions.left), height / (dimensions.bottom - dimensions.top));

	const convertPoint = (p: Point, thickness: number) => {
		const result = Point.subtract(p, { x: dimensions.left, y: dimensions.top });
		result.multScalar(scale);
		let frac = thickness / 2;
		frac -= Math.floor(frac);

		result.x = Math.floor(result.x) + frac;
		result.y = Math.floor(result.y) + frac;
		return result;
	};

	//TODO: scale line thicnkess
	React.useEffect(() => {
		const ctx = canvasRef.current.getContext("2d");
		ctx.lineJoin = "round";
		ctx.lineCap = "round";
		ctx.fillStyle = bgColor;
		ctx.fillRect(0, 0, width, height);

		for (const layer of layers) {
			for (const line of layer.lines) {
				const thickness = line.thickness > 0 ? line.thickness : 1;
				const from = convertPoint(layer.points[line.from], thickness);
				const to = convertPoint(layer.points[line.to], thickness);

				ctx.beginPath();
				ctx.moveTo(from.x, from.y);
				ctx.strokeStyle = line.color;
				ctx.lineWidth = thickness;
				ctx.lineTo(to.x, to.y);
				ctx.stroke();
			}
		}
	}, [layers]);

	return (
		<div>
			<canvas ref={canvasRef} width={width} height={height}></canvas>
		</div>
	);
}