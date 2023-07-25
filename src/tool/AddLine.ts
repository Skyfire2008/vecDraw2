
class AddLine implements Tool {

	readonly name = "AddLine";

	constructor() { }

	public onMouseDown(e: MyMouseEvent, ctx: AppContextProps) {
	}

	public onMouseMove(e: MyMouseEvent, ctx: AppContextProps) {
		if (ctx.activePoint >= 0) {
			const activePoint = ctx.layers[ctx.activeLayer].points[ctx.activePoint];
			const p1 = convertCoords(activePoint, ctx.pan, ctx.zoom, 2);
			const p2 = convertCoords(e.gridPos, ctx.pan, ctx.zoom, 2);
			ctx.tempGroup.current.innerHTML = `<line x1=${p1.x} y1=${p1.y} x2=${p2.x} y2=${p2.y} stroke="white"></line>`
		}
	}

	public onMouseUp(e: MyMouseEvent, ctx: AppContextProps) {
		const points = ctx.layers[ctx.activeLayer].points.concat(e.gridPos);
		let lines = ctx.layers[ctx.activeLayer].lines;
		const newNum = points.length - 1;
		if (ctx.activePoint > 0) {
			lines = lines.concat({ from: ctx.activePoint, to: newNum, color: "#ffffff", thickness: 0 });
		}
		const newLayers = ctx.layers.slice(0);
		newLayers[ctx.activeLayer] = { points, lines };
		ctx.setLayers(newLayers);
		ctx.setActivePoint(newNum);
	}
}