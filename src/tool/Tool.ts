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

interface Tool {
	name: string;
	onMouseDown(e: MyMouseEvent, ctx: AppContextProps);
	onMouseUp(e: MyMouseEvent, ctx: AppContextProps);
	onMouseMove(e: MyMouseEvent, ctx: AppContextProps);
	onPointClick(num: number, ctx: AppContextProps);
	onEnable(ctx: AppContextProps);
	onDisable(ctx: AppContextProps);
	//onKeyDown(key: string);
	//onKeyUp(key: string);
}