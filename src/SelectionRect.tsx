interface SelectionProps {
	pan: Point;
	zoom: number;
	svgWidth: number;
	svgHeight: number;
	gridWidth: number;
	gridHeight: number;
	selection: Set<number>;
	layers: Array<LayerData>;
	activeLayer: number;
	setLayers: (layers: Array<LayerData>) => void;
	addAction: (action: Action) => void;
}

const SelectionRect: React.FC<SelectionProps> = React.memo(({ svgWidth, svgHeight, gridWidth, gridHeight, pan, zoom, selection, layers, setLayers, addAction, activeLayer }) => {
	const [dims, setDims] = React.useState<{ left: number, right: number, top: number, bottom: number }>(null);
	const prevLayer = React.useRef<LayerData>(null);
	const prevSelection = React.useRef<Set<number>>(null);
	const origPositions = React.useRef<Map<number, Point>>(null);

	const [isTransforming, setIsTransforming] = React.useState(false);
	const referencePoint = React.useRef<PointLike>(null);

	//if layers or selection changed, calculate dims and save original positions
	//also check for isTranforming cause if it's true, selection is being actively transformed and dims/original position don't need to be recalculated
	if ((layers[activeLayer] != prevLayer.current || selection != prevSelection.current) && !isTransforming) {
		const layer = layers[activeLayer];

		const newDims = { left: Number.POSITIVE_INFINITY, right: Number.NEGATIVE_INFINITY, top: Number.POSITIVE_INFINITY, bottom: Number.NEGATIVE_INFINITY };
		for (const num of selection) {
			const item = layer.points[num];

			newDims.left = Math.min(newDims.left, item.x);
			newDims.right = Math.max(newDims.right, item.x);
			newDims.top = Math.min(newDims.top, item.y);
			newDims.bottom = Math.max(newDims.bottom, item.y);
		}

		setDims(newDims);
		prevLayer.current = layer;
		prevSelection.current = selection;

		origPositions.current = new Map<number, Point>();
		for (const num of selection) {
			origPositions.current.set(num, layer.points[num].clone());
		}
	}

	//prevents from updating with stale state in function
	const guard = React.useRef(true);
	guard.current = true;

	let pos: Point = null;
	let width = 0;
	let height = 0;
	if (dims != null) {
		pos = convertCoords({ x: dims.left, y: dims.top }, pan, zoom, 1);
		width = zoom * (dims.right - dims.left);
		height = zoom * (dims.bottom - dims.top);
	}

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
		//TODO: create action

		const layer = layers[activeLayer];
		const newPositions = new Map<number, Point>();
		for (const num of selection) {
			newPositions.set(num, layer.points[num].clone());
		}

		addAction(new ScalePoints(activeLayer, origPositions.current, newPositions));
		origPositions.current = newPositions;
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
		d.x = Math.round(d.x / gridWidth) * gridWidth;
		d.y = Math.round(d.y / gridHeight) * gridHeight;

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

	return (dims != null &&
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