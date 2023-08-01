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
	tool: Tool;
	layers: Array<LayerData>;
	setLayers: (layers: Array<LayerData>) => void;
	activeLayer: number;
	tempGroup: React.MutableRefObject<SVGGElement>;
	addAction: (action: Action) => void;
}

const AppContext = React.createContext<AppContextProps>(null);
const width = 1280;
const height = 720;

const VecDraw: React.FC<any> = () => {
	const svgRef = React.useRef<SVGSVGElement>(null);
	const mouseStartPos = React.useRef(new Point());
	const [mouseGridPos, setMouseGridPos] = React.useState(new Point());

	const [pan, setPan] = React.useState(new Point(width / 2, height / 2));
	const [zoom, setZoom] = React.useState(1.0);
	const [gridSettings, setGridSettings] = React.useState<GridSettings>({
		bgColor: "#ffffff",
		gridColor: "#b0c4de",
		width: 20,
		height: 20
	});

	const [layers, setLayers] = React.useState<Array<LayerData>>([{ points: [], lines: [] }]);
	const [activeLayer, setActiveLayer] = React.useState<number>(0);
	const [actions, setActions] = React.useState<Array<Action>>([]);

	const tools = [new Pan(), new AddLine()];
	const [tool, setTool] = React.useState<Tool>(tools[0]);
	const tempGroupRef = React.useRef<SVGGElement>(null);

	const ctx = {
		gridSettings,
		pan,
		setPan,
		zoom,
		tool,
		layers,
		setLayers,
		activeLayer,
		tempGroup: tempGroupRef,
		addAction: (action) => { setActions(actions.concat(action)) }
	};

	const convertCoords = (x: number, y: number) => {
		const rect = svgRef.current.getBoundingClientRect();
		return new Point(x - rect.left, y - rect.top);
	};

	const onMouseDown = (e: React.MouseEvent) => {
		const coords = convertCoords(e.clientX, e.clientY);
		mouseStartPos.current = new Point(coords.x, coords.y);

		const gridPos = Point.subtract(coords, pan);
		gridPos.multScalar(1 / zoom);
		gridPos.x = Math.round(gridPos.x / gridSettings.width) * gridSettings.width;
		gridPos.y = Math.round(gridPos.y / gridSettings.height) * gridSettings.height;
		setMouseGridPos(gridPos);

		tool.onMouseDown({
			pos: coords,
			gridPos,
			delta: new Point(),
			ctrlHeld: e.ctrlKey,
			shiftHeld: e.shiftKey,
			altHeld: e.altKey
		},
			ctx);
	};

	const onMouseMove = (e: React.MouseEvent) => {
		const coords = convertCoords(e.clientX, e.clientY);

		const gridPos = Point.subtract(coords, pan);
		gridPos.multScalar(1 / zoom);
		gridPos.x = Math.round(gridPos.x / gridSettings.width) * gridSettings.width;
		gridPos.y = Math.round(gridPos.y / gridSettings.height) * gridSettings.height;
		setMouseGridPos(gridPos);

		tool.onMouseMove({
			pos: coords,
			gridPos,
			delta: Point.subtract(coords, mouseStartPos.current),
			ctrlHeld: e.ctrlKey,
			shiftHeld: e.shiftKey,
			altHeld: e.altKey
		},
			ctx);
	};

	const onMouseUp = (e: React.MouseEvent) => {
		const coords = convertCoords(e.clientX, e.clientY);

		const gridPos = Point.subtract(coords, pan);
		gridPos.multScalar(1 / zoom);
		gridPos.x = Math.round(gridPos.x / gridSettings.width) * gridSettings.width;
		gridPos.y = Math.round(gridPos.y / gridSettings.height) * gridSettings.height;
		setMouseGridPos(gridPos);

		tool.onMouseUp({
			pos: coords,
			gridPos,
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
		} else if (zoom > 1) {
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

	const updateGridSettings = (value: Object) => {
		setGridSettings(Object.assign({}, gridSettings, value));
	};

	const updateGridWidth = (value: string) => {
		const numValue = Number.parseFloat(value);
		if (!Number.isNaN(numValue) && numValue > 0) {
			updateGridSettings({ width: numValue });
		}
	};

	const updateGridHeight = (value: string) => {
		const numValue = Number.parseFloat(value);
		if (!Number.isNaN(numValue) && numValue > 0) {
			updateGridSettings({ height: numValue });
		}
	};

	return (
		<div>
			<AppContext.Provider value={ctx}>
				<div>
					<label>Shape file:</label>
					<input type="file" accept=".json" onChange={onSelectFile}></input>
				</div>
				<div className="line">
					<Toolbox tools={tools} select={(newTool: Tool) => {
						tool.onDisable(ctx);
						setTool(newTool);
						newTool.onEnable(ctx);
					}} selected={tool}></Toolbox>
					<div className="column">
						<svg ref={svgRef} width={width} height={height} style={{ width, height }} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onWheel={onWheel}>
							<BgRect width={width} height={height}></BgRect>
							{layers.map((layer, i) => <Layer key={i} {...layer}></Layer>)}
							<g ref={tempGroupRef}></g>
						</svg>
						<div className="line">
							<div style={{ minWidth: 100 }}>{`X: ${mouseGridPos.x}`}</div>
							<div style={{ minWidth: 100 }}>{`Y: ${mouseGridPos.y}`}</div>
						</div>
						<div className="line" style={{ alignItems: "baseline" }}>
							<div>
								<label>Grid width:</label>
								<input defaultValue={gridSettings.width} onBlur={(e) => updateGridWidth(e.target.value)} onKeyUp={
									(e) => {
										if (e.key === "Enter") {
											(e.target as HTMLElement).blur();
										}
									}
								}></input>
							</div>
							<div>
								<label>Grid height:</label>
								<input defaultValue={gridSettings.height} onBlur={(e) => updateGridHeight(e.target.value)} onKeyUp={
									(e) => {
										if (e.key === "Enter") {
											(e.target as HTMLElement).blur();
										}
									}
								}></input>
							</div>
							<div>
								<label>Bg color:</label>
								<input type="color" value={gridSettings.bgColor} onChange={(e) => updateGridSettings({ bgColor: e.target.value })}></input>
							</div>
							<div>
								<label>Grid color:</label>
								<input type="color" value={gridSettings.gridColor} onChange={(e) => updateGridSettings({ gridColor: e.target.value })}></input>
							</div>
						</div>
					</div>
					<div className="column">
						<Preview layers={layers} width={200} height={200}></Preview>
						<ActionList actions={actions} setActions={setActions}></ActionList>
					</div>
				</div>
			</AppContext.Provider>
		</div>
	);
}