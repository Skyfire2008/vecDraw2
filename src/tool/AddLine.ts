
class AddLine implements Tool {

	readonly name = "AddLine";
	public activePoint = -1;

	constructor() { }

	public static isAddLine(tool: Tool): tool is AddLine {
		return tool.name == "AddLine";
	}

	public onMouseDown(e: MyMouseEvent, ctx: AppContextProps) {
	}

	public onMouseMove(e: MyMouseEvent, ctx: AppContextProps) {
		if (this.activePoint >= 0) {
			const activePoint = ctx.layers[ctx.activeLayer].points[this.activePoint];
			const p1 = convertCoords(activePoint, ctx.pan, ctx.zoom, 2);
			const p2 = convertCoords(e.gridPos, ctx.pan, ctx.zoom, 2);
			ctx.tempGroup.current.innerHTML = `<line x1=${p1.x} y1=${p1.y} x2=${p2.x} y2=${p2.y} stroke="white"></line>`
		}
	}

	public onMouseUp(e: MyMouseEvent, ctx: AppContextProps) {
		const points = ctx.layers[ctx.activeLayer].points.concat(e.gridPos);
		let lines = ctx.layers[ctx.activeLayer].lines;
		const newNum = points.length - 1;
		if (this.activePoint >= 0) {
			lines = lines.concat({ from: this.activePoint, to: newNum, color: "#ffffff", thickness: 0 });
			ctx.addAction(new AddLineAction(ctx.activeLayer, this.activePoint, newNum, true));
		} else {
			ctx.addAction(new AddPointAction(ctx.activeLayer, newNum));
		}
		const newLayers = ctx.layers.slice(0);
		newLayers[ctx.activeLayer] = { points, lines };
		ctx.setLayers(newLayers);

		this.activePoint = newNum;
	}

	public onPointClick(num: number, ctx: AppContextProps) {
		if (this.activePoint >= 0 && num != this.activePoint) {
			let lines = ctx.layers[ctx.activeLayer].lines;
			lines = lines.concat({ from: this.activePoint, to: num, color: "#ffffff", thickness: 0 });
			const newLayers = ctx.layers.slice(0);
			newLayers[ctx.activeLayer].lines = lines;

			ctx.setLayers(newLayers);
			ctx.addAction(new AddLineAction(ctx.activeLayer, this.activePoint, num, false));
		}

		this.activePoint = num;
	}

	public onEnable(ctx: AppContextProps) {
		this.activePoint = -1;
	}

	public onDisable(ctx: AppContextProps) {
		ctx.tempGroup.current.innerHTML = "";
	}
}