interface GridSettings {
	bgColor: string;
	gridColor: string;
	width: number;
	height: number;
}

interface AppContextProps {
	gridSettings: GridSettings;
}

const AppContext = React.createContext<AppContextProps>(null);

const VecDraw: React.FC<any> = () => {
	const width = 1280;
	const height = 720;

	const [gridSettings, setGridSettings] = React.useState<GridSettings>({
		bgColor: "darkslateblue",
		gridColor: "orange",
		width: 10,
		height: 10
	});
	const [actions, setActions] = React.useState<Array<Action>>([]);
	const [tool, setTool] = React.useState<Tool>(new Pan());

	const onMouseDown = (e: React.MouseEvent) => {
		tool.onMouseDown(e.nativeEvent);
	};

	const onMouseMove = (e: React.MouseEvent) => {
		tool.onMouseDown(e.nativeEvent);
	};

	const onMouseUp = (e: React.MouseEvent) => {
		tool.onMouseUp(e.nativeEvent);
	};

	//TODO: load settings here
	React.useEffect(() => { }, []);

	return (
		<div>
			<AppContext.Provider value={{ gridSettings: gridSettings }}>
				<svg width={width} height={height} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
					<defs>
						<pattern id="gridPattern" width={gridSettings.width} height={gridSettings.height} patternUnits="userSpaceOnUse">
							<rect x={0} y={0} width={gridSettings.width} height={gridSettings.height} fill={gridSettings.bgColor}></rect>
							<line x1={gridSettings.width} y1={0} x2={gridSettings.width} y2={gridSettings.height} stroke={gridSettings.gridColor}></line>
							<line x1={0} y1={gridSettings.height} x2={gridSettings.width} y2={gridSettings.height} stroke={gridSettings.gridColor}></line>
						</pattern>
					</defs>
					<rect x={0} y={0} width={width} height={height} fill="url(#gridPattern)"></rect>
				</svg>
			</AppContext.Provider>
		</div>
	);
};