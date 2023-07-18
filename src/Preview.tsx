
interface PreviewProps {
	layers: Array<LayerData>;
	left: number;
	right: number;
	top: number;
	bottom: number;
}

const Preview: React.FC<PreviewProps> = ({ layers, left, right, top, bottom }) => {

	const canvasRef = React.useRef<HTMLCanvasElement>();

	React.useEffect(() => {
		const ctx = canvasRef.current.getContext("2d");
		ctx.lineJoin = "round";
		ctx.lineCap = "round";
		for (const layer of layers) {
			for (const line of layer.lines) {

			}
		}
	}, [layers]);

	return (
		<div>
			<canvas ref={canvasRef}></canvas>
		</div>
	);
}