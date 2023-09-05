interface GridSettings {
	bgColor: string;
	gridColor: string;
	width: number;
	height: number;
	mark: number;
}

interface Highlight {
	layerNum: number;
	pointNum?: number;
	lineNum?: number;
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
	lineThickness: number;
	lineColor: string;
	selection: Set<PointLike>;
	setSelection: (selection: Set<PointLike>) => void;
	tempGroup: React.MutableRefObject<SVGGElement>;
	addAction: (action: Action) => void;
	setHighlight: (highlight: Highlight) => void;
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
		width: 8,
		height: 8,
		mark: 4
	});

	const [layers, setLayers] = React.useState<Array<LayerData>>([{ points: [], lines: [] }]);
	const [activeLayer, setActiveLayer] = React.useState<number>(0);
	const [actions, setActions] = React.useState<Array<Action>>([]);
	const [exportScale, setExportScale] = React.useState(1);

	const [lineColor, setLineColor] = React.useState("#000000");
	const [lineThickness, setLineThickness] = React.useState(1);

	const [selection, setSelection] = React.useState<Set<PointLike>>(new Set<PointLike>());
	const [highlight, setHighlight] = React.useState<Highlight>(null);

	const tools = React.useState([new Pan(), new AddLine(), new Select(), new Move(), new Delete()])[0];
	const [tool, setTool] = React.useState<Tool>(tools[1]);
	const panTool = React.useState(tools[0])[0];
	const forcePan = React.useRef(false);
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
		lineColor,
		lineThickness,
		selection,
		setSelection,
		tempGroup: tempGroupRef,
		addAction: (action: Action) => {
			action.do(ctx);
			setActions(actions.concat(action))
		},
		setHighlight
	};

	const svgCoords = (x: number, y: number) => {
		const rect = svgRef.current.getBoundingClientRect();
		return new Point(x - rect.left, y - rect.top);
	};

	const onMouseDown = (e: React.MouseEvent) => {
		const coords = svgCoords(e.clientX, e.clientY);
		mouseStartPos.current = new Point(coords.x, coords.y);

		const shapePos = Point.subtract(coords, pan);
		shapePos.multScalar(1 / zoom);
		const gridPos = new Point(Math.round(shapePos.x / gridSettings.width) * gridSettings.width, Math.round(shapePos.y / gridSettings.height) * gridSettings.height);
		setMouseGridPos(gridPos);

		const event: MyMouseEvent = {
			pos: coords,
			shapePos,
			gridPos,
			delta: new Point(),
			ctrlHeld: e.ctrlKey,
			shiftHeld: e.shiftKey,
			altHeld: e.altKey
		};

		if (e.button != 1) {
			tool.onMouseDown(event, ctx);
		} else {
			forcePan.current = true;
			panTool.onMouseDown(event, ctx);
		}
	};

	const onMouseMove = (e: React.MouseEvent) => {
		const coords = svgCoords(e.clientX, e.clientY);

		const shapePos = Point.subtract(coords, pan);
		shapePos.multScalar(1 / zoom);
		const gridPos = new Point(Math.round(shapePos.x / gridSettings.width) * gridSettings.width, Math.round(shapePos.y / gridSettings.height) * gridSettings.height);
		setMouseGridPos(gridPos);

		const event = {
			pos: coords,
			shapePos,
			gridPos,
			delta: Point.subtract(coords, mouseStartPos.current),
			ctrlHeld: e.ctrlKey,
			shiftHeld: e.shiftKey,
			altHeld: e.altKey
		};

		tool.onMouseMove(event, ctx);
		if (forcePan.current) {
			panTool.onMouseMove(event, ctx);
		}
	};

	const onMouseUp = (e: React.MouseEvent) => {
		const coords = svgCoords(e.clientX, e.clientY);

		const shapePos = Point.subtract(coords, pan);
		shapePos.multScalar(1 / zoom);
		const gridPos = new Point(Math.round(shapePos.x / gridSettings.width) * gridSettings.width, Math.round(shapePos.y / gridSettings.height) * gridSettings.height);
		setMouseGridPos(gridPos);

		const event = {
			pos: coords,
			shapePos,
			gridPos,
			delta: Point.subtract(coords, mouseStartPos.current),
			ctrlHeld: e.ctrlKey,
			shiftHeld: e.shiftKey,
			altHeld: e.altKey
		};

		if (forcePan.current) {
			panTool.onMouseUp(event, ctx);
		} else {
			tool.onMouseUp(event, ctx);
		}
		forcePan.current = false;
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
				try {
					const shape = loadShape(fr.result as string);
					if (shape.layers != null) {
						setLayers(shape.layers);
					} else {
						window.alert("Invalid file format");
					}
				} catch (e) {
					window.alert("Invalid file format");
				}
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

	const saveFile = () => {
		const data: ShapeData = { ver: 2, layers };
		const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
		const a = document.createElement("a");
		a.download = "shape.json";
		a.href = URL.createObjectURL(blob);
		a.addEventListener("click", (e) => setTimeout(() => URL.revokeObjectURL(a.href), 1000));
		a.click();
	};

	const exportAsPng = () => {
		const canvas = document.createElement("canvas");
		drawOntoCanvas(canvas, layers, gridSettings.bgColor, exportScale);

		const a = document.createElement("a");
		a.download = "export.png";
		canvas.toBlob((blob) => {
			a.href = URL.createObjectURL(blob);
			a.addEventListener("click", (e) => setTimeout(() => URL.revokeObjectURL(a.href), 1000));
			a.click();
		});
	};

	return (
		<div>
			<AppContext.Provider value={ctx}>
				<div className="line panel">
					<div>
						<label>Load file:</label>
						<input type="file" accept=".json" onChange={onSelectFile}></input>
					</div>
					<button onClick={saveFile}>Save file</button>
					<button onClick={exportAsPng}>Export as PNG</button>
					<div>
						<label> Export scale:</label>
						<input type="number" min="1" step="0.5" value={exportScale} onChange={(e) => setExportScale(e.target.valueAsNumber)}></input>
					</div>
				</div>

				<div className="line">
					<Toolbox tools={tools} select={(newTool: Tool) => {
						tool?.onDisable(ctx);
						setTool(newTool);
						newTool?.onEnable(ctx);
					}} selected={tool}></Toolbox>
					<div className="column">
						<svg ref={svgRef} width={width} height={height} style={{ width, height }} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onWheel={onWheel}>
							<BgRect width={width} height={height} gridSettings={gridSettings} zoom={zoom} pan={pan}></BgRect>
							{layers.map((layer, i) => <Layer key={i} layer={layer} highlight={highlight?.layerNum == i ? highlight : null} pan={pan} zoom={zoom}></Layer>)}
							<g ref={tempGroupRef}></g>
						</svg>
						<div className="line">
							<div style={{ minWidth: 100 }}>{`X: ${mouseGridPos.x}`}</div>
							<div style={{ minWidth: 100 }}>{`Y: ${mouseGridPos.y}`}</div>
						</div>
					</div>
					<div className="column">
						<Preview layers={layers} width={200} height={200} bgColor={gridSettings.bgColor}></Preview>
						<ActionList actions={actions} setActions={setActions}></ActionList>
					</div>
				</div>

				<div className="line panel">
					<div>
						<label>Thickness:</label>
						<input type="text" defaultValue={lineThickness} onBlur={(e) => setLineThickness(Number.parseInt(e.target.value))} onKeyDown={
							(e) => {
								if (e.key == "Enter") {
									(e.target as HTMLElement).blur()
								}
							}
						}></input>
					</div>
					<div>
						<label>Color:</label>
						<input type="color" defaultValue={lineColor} onChange={(e) => setLineColor(e.target.value)}></input>
					</div>
				</div>
				<div className="line panel">
					<div>
						<label>Grid width:</label>
						<input type="text" defaultValue={gridSettings.width} onBlur={(e) => updateGridWidth(e.target.value)} onKeyUp={
							(e) => {
								if (e.key === "Enter") {
									(e.target as HTMLElement).blur();
								}
							}
						}></input>
					</div>
					<div>
						<label>Grid height:</label>
						<input type="text" defaultValue={gridSettings.height} onBlur={(e) => updateGridHeight(e.target.value)} onKeyUp={
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
					<div>
						<label>Mark:</label>
						<input type="number" value={gridSettings.mark} onChange={(e) => updateGridSettings({ mark: e.target.value })}></input>
					</div>
				</div>
			</AppContext.Provider >
		</div >
	);
}
