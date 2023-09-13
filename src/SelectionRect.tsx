interface SelectionProps {
	//pan: Point;
	//zoom: number;
	dims: { left: number, right: number, top: number, bottom: number };
	svgWidth: number;
	svgHeight: number;
}

const SelectionRect: React.FC<SelectionProps> = React.memo(({ dims, svgWidth, svgHeight, /*pan, zoom*/ }) => {
	const ctx = React.useContext(AppContext);

	const pos = convertCoords({ x: dims.left, y: dims.top }, ctx.pan, ctx.zoom, 1);
	const width = ctx.zoom * (dims.right - dims.left);
	const height = ctx.zoom * (dims.bottom - dims.top);

	const [isTransforming, setIsTransforming] = React.useState(false);
	const stretchPoint = React.useRef<PointLike>(null);
	const referencePoint = React.useRef<PointLike>(null);

	const onStretchMouseDown = (newReferencePoint: PointLike, newStretchPoint: PointLike, e: React.MouseEvent) => {
		e.bubbles = false;
		e.stopPropagation();

		referencePoint.current = newReferencePoint;
		stretchPoint.current = newStretchPoint;
		//stretchStartPos.current = { x: e.clientX, y: e.clientY };
		setIsTransforming(true);
	}

	const onOverlayMouseUp = (e: React.MouseEvent) => {
		e.bubbles = false;
		e.stopPropagation();
		setIsTransforming(false);
	}

	const onOverlayMouseMove = (e: React.MouseEvent) => {
		e.bubbles = false;
		e.stopPropagation();

		//TODO: use VecDraw's methods to do this, somehow
		const rect = (e.target as HTMLElement).getBoundingClientRect();
		const d = Point.subtract({ x: e.clientX, y: e.clientY }, Point.sum(ctx.pan, { x: rect.x, y: rect.y }));
		d.multScalar(1 / ctx.zoom);

		const scaling = new Point(Math.abs(d.x - referencePoint.current.x), Math.abs(d.y - referencePoint.current.y));
		scaling.div({ x: width, y: height });

		const layer = ctx.layers[ctx.activeLayer];
		for (const num of ctx.selection) {
			const point = layer.points[num];
			point.sub(referencePoint.current);
			point.mult(scaling);
			point.add(referencePoint.current)
		}

		ctx.layers[ctx.activeLayer] = { lines: layer.lines, points: layer.points.slice(0) };
		ctx.setLayers(ctx.layers.slice(0));
	}

	return (
		<g>
			<rect
				x={pos.x}
				y={pos.y}
				width={width}
				height={height}
				stroke="black"
				strokeWidth="1"
				fill="none"
			></rect>
			<rect
				x={pos.x + 1}
				y={pos.y + 1}
				width={width - 2}
				height={height - 2}
				stroke="white"
				strokeWidth="1"
				fill="none"
			></rect>
			<use
				href="#stretch"
				x={pos.x}
				y={pos.y}
				onMouseDown={onStretchMouseDown.bind(null, { x: dims.right, y: dims.bottom }, { x: dims.left, y: dims.top })}
			></use>
			<use
				href="#stretch"
				x={pos.x + width}
				y={pos.y}
				onMouseDown={onStretchMouseDown.bind(null, { x: dims.left, y: dims.bottom }, { x: dims.right, y: dims.top })}
			></use>
			<use
				href="#stretch"
				x={pos.x}
				y={pos.y + height}
				onMouseDown={onStretchMouseDown.bind(null, { x: dims.right, y: dims.top }, { x: dims.left, y: dims.bottom })}
			></use>
			<use
				href="#stretch"
				x={pos.x + width}
				y={pos.y + height}
				onMouseDown={onStretchMouseDown.bind(null, { x: dims.left, y: dims.top }, { x: dims.right, y: dims.bottom })}
			></use>
			{isTransforming &&
				<rect x="0" y="0" width={svgWidth} height={svgHeight} fill="#00000000" onMouseUp={onOverlayMouseUp} onMouseMove={onOverlayMouseMove}></rect>
			}
		</g>
	);
});