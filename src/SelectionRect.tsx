interface SelectionProps {
	pan: Point;
	zoom: number;
	svgWidth: number;
	svgHeight: number;
	selection: Set<number>;
	layers: Array<LayerData>;
	activeLayer: number;
	setLayers: (layers: Array<LayerData>) => void;
}

const SelectionRect: React.FC<SelectionProps> = React.memo(({ svgWidth, svgHeight, pan, zoom, selection, layers, setLayers, activeLayer }) => {

	//TODO: update dims when new points added/removed from selection
	const [dims, setDims] = React.useState<{ left: number, right: number, top: number, bottom: number }>(() => {
		const result = { left: Number.POSITIVE_INFINITY, right: Number.NEGATIVE_INFINITY, top: Number.POSITIVE_INFINITY, bottom: Number.NEGATIVE_INFINITY };
		const layer = layers[activeLayer];

		for (const num of selection) {
			const item = layer.points[num];

			result.left = Math.min(result.left, item.x);
			result.right = Math.max(result.right, item.x);
			result.top = Math.min(result.top, item.y);
			result.bottom = Math.max(result.bottom, item.y);
		}

		return result;
	});

	//prevents from updating with stale state in function
	const guard = React.useRef(true);
	guard.current = true;

	const pos = convertCoords({ x: dims.left, y: dims.top }, pan, zoom, 1);
	const width = zoom * (dims.right - dims.left);
	const height = zoom * (dims.bottom - dims.top);

	const [isTransforming, setIsTransforming] = React.useState(false);
	const referencePoint = React.useRef<PointLike>(null);

	const onStretchMouseDown = (newReferencePoint: PointLike, e: React.MouseEvent) => {
		e.bubbles = false;
		e.stopPropagation();

		referencePoint.current = newReferencePoint;
		setIsTransforming(true);
	}

	const onOverlayMouseUp = (e: React.MouseEvent) => {
		e.bubbles = false;
		e.stopPropagation();
		setIsTransforming(false);
	}

	const onOverlayMouseMove = (e: React.MouseEvent) => {
		//updating component will set guard=true, if component not updated, skip event
		if (!guard.current) {
			return;
		}

		e.bubbles = false;
		e.stopPropagation();

		//TODO: use VecDraw's methods to do this, somehow
		const rect = (e.target as HTMLElement).getBoundingClientRect();
		const d = Point.subtract({ x: e.clientX, y: e.clientY }, Point.sum(pan, { x: rect.x, y: rect.y }));
		d.multScalar(1 / zoom);

		const scaling = new Point(Math.abs(d.x - referencePoint.current.x), Math.abs(d.y - referencePoint.current.y));
		scaling.div({ x: width, y: height });

		//set new dimensions
		const newDims = Object.assign({}, dims);
		if (referencePoint.current.x == dims.left) {
			newDims.right += d.x - newDims.right;
		} else {
			newDims.left -= newDims.left - d.x;
		}
		if (referencePoint.current.y == dims.top) {
			newDims.bottom += d.y - newDims.bottom;
		} else {
			newDims.top -= newDims.top - d.y;
		}
		setDims(newDims);

		const layer = layers[activeLayer];
		for (const num of selection) {
			const point = layer.points[num];
			point.sub(referencePoint.current);
			point.mult(scaling);
			point.add(referencePoint.current);
		}

		layers[activeLayer] = { lines: layer.lines, points: layer.points.slice(0) };
		setLayers(layers.slice(0));
		setDims(newDims);

		guard.current = false;
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
				onMouseDown={onStretchMouseDown.bind(null, { x: dims.right, y: dims.bottom })}
			></use>
			<use
				href="#stretch"
				x={pos.x + width}
				y={pos.y}
				onMouseDown={onStretchMouseDown.bind(null, { x: dims.left, y: dims.bottom })}
			></use>
			<use
				href="#stretch"
				x={pos.x}
				y={pos.y + height}
				onMouseDown={onStretchMouseDown.bind(null, { x: dims.right, y: dims.top })}
			></use>
			<use
				href="#stretch"
				x={pos.x + width}
				y={pos.y + height}
				onMouseDown={onStretchMouseDown.bind(null, { x: dims.left, y: dims.top })}
			></use>
			{isTransforming &&
				<rect x="0" y="0" width={svgWidth} height={svgHeight} fill="#00000000" onMouseUp={onOverlayMouseUp} onMouseMove={onOverlayMouseMove}></rect>
			}
		</g>
	);
});