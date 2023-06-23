interface Tool {
	onMouseDown(pos: Point);
	onMouseUp(pos: Point);
	onMouseMove(pos: Point);
	onKeyDown(key: string);
	onKeyUp(key: string);
}