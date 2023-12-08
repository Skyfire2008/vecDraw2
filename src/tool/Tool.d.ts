declare namespace tool {

	export interface MyMouseEvent {
		/** Position relative to top left corner of svg */
		pos: math.Point;
		/** Position relative to shape */
		shapePos: math.Point;
		delta: math.Point;
		/** Position on the grid */
		gridPos: math.Point;
		ctrlHeld: boolean;
		shiftHeld: boolean;
		altHeld: boolean;
	}

	export interface ToolOption {
		name: string;
		description: string;
	}

	export interface Tool {
		readonly name: string;
		readonly description: string;
		readonly options?: Array<ToolOption>;
		setOptionInd?(num: number);
		getOptionInd?(): number;

		onMouseDown(e: MyMouseEvent, ctx: ui.AppContextProps);
		onMouseUp(e: MyMouseEvent, ctx: ui.AppContextProps);
		onMouseMove(e: MyMouseEvent, ctx: ui.AppContextProps);
		onPointClick?(num: number, ctx: ui.AppContextProps, ctrlHeld: boolean, shiftHeld: boolean);
		onPointEnter?(num: number, ctx: ui.AppContextProps);
		onPointLeave?(num: number, ctx: ui.AppContextProps);
		onPolygonEnter?(num: number, ctx: ui.AppContextProps);
		onPolygonLeave?(num: number, ctx: ui.AppContextProps);
		onPolygonClick?(num: number, ctX: ui.AppContextProps);
		onEnable?(ctx: ui.AppContextProps);
		onDisable?(ctx: ui.AppContextProps);
		redraw?();
		//onKeyDown(key: string);
		//onKeyUp(key: string);
	}
}