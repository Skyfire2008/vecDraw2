interface MyMouseEvent {
	pos: Point;
	delta: Point;
	ctrlHeld: boolean;
	shiftHeld: boolean;
	altHeld: boolean;
}

interface Tool {
	name: string;
	onMouseDown(e: MyMouseEvent, ctx: AppContextProps);
	onMouseUp(e: MyMouseEvent, ctx: AppContextProps);
	onMouseMove(e: MyMouseEvent, ctx: AppContextProps);
	//onKeyDown(key: string);
	//onKeyUp(key: string);
}