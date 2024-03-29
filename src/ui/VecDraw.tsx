namespace ui {

	export interface GridSettings {
		bgColor: string;
		gridColor: string;
		width: number;
		height: number;
		mark: number;
	}

	export interface Highlight {
		layerNum: number;
		pointNum?: number;
		lineNum?: number;
	}

	export interface AppContextProps {
		gridSettings: GridSettings;
		pan: math.Point;
		setPan: (pos: math.Point) => void;
		zoom: number;
		tool: tool.Tool;
		layers: Array<types.LayerData>;
		setLayers: (layers: Array<types.LayerData>) => void;
		activeLayer: number;
		lineThickness: number;
		lineColor: string;
		selection: Set<number>;
		setSelection: (selection: Set<number>) => void;
		tempGroup: React.MutableRefObject<SVGGElement>;
		addAction: (action: action.Action) => void;
		setHighlight: (highlight: Highlight) => void;
	}

	export const AppContext = React.createContext<AppContextProps>(null);
	const width = 1280;
	const height = 720;

	export const VecDraw: React.FC<any> = () => {
		const svgRef = React.useRef<SVGSVGElement>(null);
		const mouseStartPos = React.useRef(new math.Point());
		const [mouseGridPos, setMouseGridPos] = React.useState(new math.Point());

		const [pan, setPan] = React.useState(new math.Point(width / 2, height / 2));
		const [zoom, setZoom] = React.useState(1.0);
		const [gridSettings, setGridSettings] = React.useState<GridSettings>({
			bgColor: "#ffffff",
			gridColor: "#b0c4de",
			width: 8,
			height: 8,
			mark: 4
		});

		const [layers, setLayers] = React.useState<Array<types.LayerData>>([{ points: [], lines: [], polygons: [] }]);
		const [activeLayer, setActiveLayer] = React.useState<number>(0);
		const [actions, setActions] = React.useState<Array<action.Action>>([]);

		const [lineColor, setLineColor] = React.useState("#000000");
		const [lineThickness, setLineThickness] = React.useState(1);

		const [selection, setSelection] = React.useState(new Set<number>());
		const [highlight, setHighlight] = React.useState<Highlight>(null);

		const tools = React.useState([new tool.Pan(), new tool.AddLine(), new tool.AddPolygon(), new tool.Select(), new tool.Move(), new tool.Delete(), new tool.Cut()])[0];
		const [currentTool, setCurrentTool] = React.useState<tool.Tool>(tools[1]);
		const panTool = React.useState(tools[0])[0];
		const forcePan = React.useRef(false);
		const tempGroupRef = React.useRef<SVGGElement>(null);

		const [exportDialogShown, setExportDialogShown] = React.useState(false);

		const ctx = {
			gridSettings,
			pan,
			setPan,
			zoom,
			tool: currentTool,
			layers,
			setLayers,
			activeLayer,
			lineColor,
			lineThickness,
			selection,
			setSelection,
			tempGroup: tempGroupRef,
			addAction: (action: action.Action) => {
				action.do(ctx);
				setActions(actions.concat(action))
			},
			setHighlight
		};

		const svgCoords = (x: number, y: number) => {
			const rect = svgRef.current.getBoundingClientRect();
			return new math.Point(x - rect.left, y - rect.top);
		};

		const onMouseDown = (e: React.MouseEvent) => {
			const coords = svgCoords(e.clientX, e.clientY);
			mouseStartPos.current = new math.Point(coords.x, coords.y);

			const shapePos = math.Point.subtract(coords, pan);
			shapePos.multScalar(1 / zoom);
			const gridPos = new math.Point(Math.round(shapePos.x / gridSettings.width) * gridSettings.width, Math.round(shapePos.y / gridSettings.height) * gridSettings.height);
			setMouseGridPos(gridPos);

			const event: tool.MyMouseEvent = {
				pos: coords,
				shapePos,
				gridPos,
				delta: new math.Point(),
				ctrlHeld: e.ctrlKey,
				shiftHeld: e.shiftKey,
				altHeld: e.altKey
			};

			if (e.button != 1) {
				currentTool.onMouseDown(event, ctx);
			} else {
				forcePan.current = true;
				panTool.onMouseDown(event, ctx);
			}
		};

		const onMouseMove = (e: React.MouseEvent) => {
			const coords = svgCoords(e.clientX, e.clientY);

			const shapePos = math.Point.subtract(coords, pan);
			shapePos.multScalar(1 / zoom);
			const gridPos = new math.Point(Math.round(shapePos.x / gridSettings.width) * gridSettings.width, Math.round(shapePos.y / gridSettings.height) * gridSettings.height);
			setMouseGridPos(gridPos);

			const event = {
				pos: coords,
				shapePos,
				gridPos,
				delta: math.Point.subtract(coords, mouseStartPos.current),
				ctrlHeld: e.ctrlKey,
				shiftHeld: e.shiftKey,
				altHeld: e.altKey
			};

			currentTool.onMouseMove(event, ctx);
			if (forcePan.current) {
				panTool.onMouseMove(event, ctx);
			}
		};

		const onMouseUp = (e: React.MouseEvent) => {
			const coords = svgCoords(e.clientX, e.clientY);

			const shapePos = math.Point.subtract(coords, pan);
			shapePos.multScalar(1 / zoom);
			const gridPos = new math.Point(Math.round(shapePos.x / gridSettings.width) * gridSettings.width, Math.round(shapePos.y / gridSettings.height) * gridSettings.height);
			setMouseGridPos(gridPos);

			const event = {
				pos: coords,
				shapePos,
				gridPos,
				delta: math.Point.subtract(coords, mouseStartPos.current),
				ctrlHeld: e.ctrlKey,
				shiftHeld: e.shiftKey,
				altHeld: e.altKey
			};

			if (forcePan.current) {
				panTool.onMouseUp(event, ctx);
			} else {
				currentTool.onMouseUp(event, ctx);
			}
			forcePan.current = false;
		};

		const onWheel = (e: React.WheelEvent) => {
			if (e.deltaY < 0) {
				setZoom(zoom * 2);
				pan.sub({ x: width / 2, y: height / 2 });
				pan.multScalar(2);
				setPan(math.Point.sum(pan, { x: width / 2, y: height / 2 }));
			} else if (zoom > 1) {
				setZoom(zoom / 2);
				pan.sub({ x: width / 2, y: height / 2 });
				pan.multScalar(1 / 2);
				setPan(math.Point.sum(pan, { x: width / 2, y: height / 2 }));
			}
		}

		const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
			const files = e.target.files;
			if (files.length > 0) {
				const fr = new FileReader();
				fr.addEventListener("load", () => {
					try {
						const shape = util.loadShape(fr.result as string);
						if (shape != null) {
							setLayers(shape);
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
			const data: types.ShapeData = { ver: 2, layers };
			const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
			const a = document.createElement("a");
			a.download = "shape.json";
			a.href = URL.createObjectURL(blob);
			a.addEventListener("click", (e) => setTimeout(() => URL.revokeObjectURL(a.href), 1000));
			a.click();
		};

		return (
			<div>
				<AppContext.Provider value={ctx}>
					<ExportDialog open={exportDialogShown} layers={layers} bgColor={gridSettings.bgColor} onClose={() => setExportDialogShown(false)}></ExportDialog>
					<div className="line panel">
						<div>
							<label>Load file:</label>
							<input type="file" accept=".json" onChange={onSelectFile}></input>
						</div>
						<button onClick={saveFile}>Save file</button>
						<button onClick={() => setExportDialogShown(true)}>Export as...</button>
					</div>

					<div className="line">
						<Toolbox tools={tools} select={(newTool: tool.Tool) => {
							if (currentTool.onDisable != null) {
								currentTool.onDisable(ctx);
							}
							setCurrentTool(newTool);
							if (newTool.onEnable != null) {
								newTool.onEnable(ctx);
							}
						}} selected={currentTool}></Toolbox>
						<div className="column">
							<svg ref={svgRef} width={width} height={height} style={{ width, height }} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onWheel={onWheel}>
								<BgRect width={width} height={height} gridSettings={gridSettings} zoom={zoom} pan={pan}></BgRect>
								{layers.map((layer, i) => <Layer key={i} num={i} layer={layer} highlight={highlight?.layerNum == i ? highlight : null} pan={pan} zoom={zoom}></Layer>)}
								<g ref={tempGroupRef} className="no-mouse-events"></g>
								{selection.size > 0 &&
									<SelectionRect
										svgWidth={width}
										svgHeight={height}
										gridWidth={gridSettings.width}
										gridHeight={gridSettings.height}
										pan={pan}
										zoom={zoom}
										layers={layers}
										setLayers={setLayers}
										addAction={(action: action.Action) => {
											action.do(ctx);
											setActions(actions.concat(action))
										}}
										activeLayer={activeLayer}
										selection={selection}
									></SelectionRect>
								}
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
							<input type="text" defaultValue={lineThickness} onBlur={(e) => {
								const thickness = Number.parseInt(e.target.value);
								setLineThickness(thickness);
								if (selection.size > 1) {
									ctx.addAction(new action.ChangeSelectionProperties(activeLayer, selection, thickness, null));
								}
							}} onKeyDown={
								(e) => {
									if (e.key == "Enter") {
										(e.target as HTMLElement).blur()
									}
								}
							}></input>
						</div>
						<div className="line panel">
							<label>Color:</label>
							<ColorPicker value={lineColor} setValue={setLineColor} onClose={
								(color) => {
									if (selection.size > 1) {
										ctx.addAction(new action.ChangeSelectionProperties(activeLayer, selection, null, color));
									}
								}
							}></ColorPicker>
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

}