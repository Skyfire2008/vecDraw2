interface GridSettings {
	bgColor: string;
	gridColor: string;
	width: number;
	height: number;
}

interface AppContextProps {
	gridSettings: GridSettings;
	pan: Point;
	setPan: (pos: Point) => void;
	zoom: number;
}

const AppContext = React.createContext<AppContextProps>(null);
const width = 1280;
const height = 720;

const VecDraw: React.FC<any> = () => {
	const svgRef = React.useRef<SVGSVGElement>(null);
	const mouseStartPos = React.useRef(new Point());

	const [pan, setPan] = React.useState(new Point(width / 2, height / 2));
	const [zoom, setZoom] = React.useState(1.0);
	const [gridSettings, setGridSettings] = React.useState<GridSettings>({
		bgColor: "darkslateblue",
		gridColor: "orange",
		width: 20,
		height: 20
	});

	const [layers, setLayers] = React.useState<Array<LayerData>>([]);
	const [actions, setActions] = React.useState<Array<Action>>([]);
	const [tool, setTool] = React.useState<Tool>(new Pan());

	const ctx = { gridSettings, pan, setPan, zoom };

	const convertCoords = (x: number, y: number) => {
		const rect = svgRef.current.getBoundingClientRect();
		return new Point(x - rect.left, y - rect.top);
	};

	const onMouseDown = (e: React.MouseEvent) => {
		const coords = convertCoords(e.clientX, e.clientY);
		mouseStartPos.current = new Point(coords.x, coords.y);
		tool.onMouseDown({
			pos: coords,
			delta: new Point(),
			ctrlHeld: e.ctrlKey,
			shiftHeld: e.shiftKey,
			altHeld: e.altKey
		},
			ctx);
	};

	const onMouseMove = (e: React.MouseEvent) => {
		const coords = convertCoords(e.clientX, e.clientY);
		tool.onMouseMove({
			pos: coords,
			delta: Point.subtract(coords, mouseStartPos.current),
			ctrlHeld: e.ctrlKey,
			shiftHeld: e.shiftKey,
			altHeld: e.altKey
		},
			ctx);
	};

	const onMouseUp = (e: React.MouseEvent) => {
		const coords = convertCoords(e.clientX, e.clientY);
		tool.onMouseUp({
			pos: coords,
			delta: Point.subtract(coords, mouseStartPos.current),
			ctrlHeld: e.ctrlKey,
			shiftHeld: e.shiftKey,
			altHeld: e.altKey
		},
			ctx);
	};

	const onWheel = (e: React.WheelEvent) => {
		if (e.deltaY < 0) {
			setZoom(zoom * 2);
		} else {
			setZoom(zoom / 2);
		}
	}

	const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files.length > 0) {
			const fr = new FileReader();
			fr.addEventListener("load", () => {
				setLayers(loadShape(fr.result as string).layers);
			});

			fr.readAsText(files[0]);
		}
	};

	/*const onKeyDown = (e: KeyboardEvent) =>{

	}*/

	//TODO: load settings here
	React.useEffect(() => { }, []);

	return (
		<div>
			<AppContext.Provider value={ctx}>
				<div>
					<label>Shape file:</label>
					<input type="file" accept=".json" onChange={onSelectFile}></input>
				</div>
				<svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} width={width} height={height} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onWheel={onWheel}>
					<defs>
						<symbol overflow="visible" id="pointRect">
							<rect x="-4" y="-4" width="8" height="8" stroke="white" fill="none"></rect>
						</symbol>
					</defs>
					<BgRect width={width} height={height}></BgRect>
					{layers.map((layer, i) => <Layer key={i} {...layer}></Layer>)}
				</svg>
			</AppContext.Provider>
		</div>
	);
}