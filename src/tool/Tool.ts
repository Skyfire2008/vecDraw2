interface MyMouseEvent {
	pos: Point;
	delta: Point;
	ctrlHeld: boolean;
	shiftHeld: boolean;
	altHeld: boolean;
}

interface Tool {
	onMouseDown(e: MyMouseEvent, ctx: AppContextProps);
	onMouseUp(e: MyMouseEvent, ctx: AppContextProps);
	onMouseMove(e: MyMouseEvent, ctx: AppContextProps);
	//onKeyDown(key: string);
	//onKeyUp(key: string);
}