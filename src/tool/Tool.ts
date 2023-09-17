interface MyMouseEvent {
	/** Position relative to top left corner of svg */
	pos: Point;
	/** Position relative to shape */
	shapePos: Point;
	delta: Point;
	/** Position on the grid */
	gridPos: Point;
	ctrlHeld: boolean;
	shiftHeld: boolean;
	altHeld: boolean;
}

interface ToolOption {
	name: string;
	description: string;
}

interface Tool {
	readonly name: string;
	readonly description: string;
	readonly options?: Array<ToolOption>;
	setOptionInd?(num: number);
	getOptionInd?(): number;

	onMouseDown(e: MyMouseEvent, ctx: AppContextProps);
	onMouseUp(e: MyMouseEvent, ctx: AppContextProps);
	onMouseMove(e: MyMouseEvent, ctx: AppContextProps);
	onPointClick?(num: number, ctx: AppContextProps, ctrlHeld: boolean, shiftHeld: boolean);
	onPointEnter?(num: number, ctx: AppContextProps);
	onPointLeave?(num: number, ctx: AppContextProps);
	onEnable?(ctx: AppContextProps);
	onDisable?(ctx: AppContextProps);
	redraw?();
	//onKeyDown(key: string);
	//onKeyUp(key: string);
}