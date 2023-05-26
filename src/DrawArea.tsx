
interface DrawAreaProps {
	width: number;
	height: number;
}

const DrawArea: React.FC<DrawAreaProps> = ({ width, height }) => {
	const context = React.useContext(AppContext);

	const [pan, setPan] = React.useState<Point>(new Point());
	const isDragging = React.useRef(false);
	const dragStartPos = React.useRef<Point>(null);

	const onMouseDown = (e: React.MouseEvent) => {
		isDragging.current = true;
		dragStartPos.current = new Point(e.clientX, e.clientY);
	};

	const onMouseMove = (e: React.MouseEvent) => {
		if (isDragging.current) {
			console.log(e.clientX, e.clientY);
		}
	}

	const onMouseUp = (e: React.MouseEvent) => {
		isDragging.current = false;
	}

	return (
		<svg width={width} height={height} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
			<defs>
				<pattern id="gridPattern" width={context.gridWidth} height={context.gridHeight} patternUnits="userSpaceOnUse">
					<rect x={0} y={0} width={context.gridWidth} height={context.gridHeight} fill={context.bgColor}></rect>
					<line x1={context.gridWidth} y1={0} x2={context.gridWidth} y2={context.gridHeight} stroke={context.gridColor}></line>
					<line x1={0} y1={context.gridHeight} x2={context.gridWidth} y2={context.gridHeight} stroke={context.gridColor}></line>
				</pattern>
			</defs>
			<rect x={0} y={0} width={width} height={height} fill="url(#gridPattern)"></rect>
		</svg>
	);
};