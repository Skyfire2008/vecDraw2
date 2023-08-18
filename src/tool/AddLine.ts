
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

		const pos = convertCoords(e.gridPos, ctx.pan, ctx.zoom, 0);
		let newInnerHtml = `
		<rect class="temp-point" x=${pos.x - 3.5} y=${pos.y - 3.5} width="7" height="7" stroke="black" fill="#00000000"></rect>
		<rect class="temp-point" x=${pos.x - 2.5} y=${pos.y - 2.5} width="5" height="5" stroke="white" fill="none"></rect>`;

		//let newInnerHtml = "";

		if (this.activePoint >= 0) {
			const activePoint = ctx.layers[ctx.activeLayer].points[this.activePoint];
			const thickness = ctx.lineThickness != 0 ? ctx.lineThickness : 2;
			const p1 = convertCoords(activePoint, ctx.pan, ctx.zoom, thickness);
			const p2 = convertCoords(e.gridPos, ctx.pan, ctx.zoom, thickness);
			newInnerHtml = `<line x1=${p1.x} y1=${p1.y} x2=${p2.x} y2=${p2.y} stroke=${ctx.lineColor} stroke-width=${thickness}></line>` + newInnerHtml;
		}
		ctx.tempGroup.current.innerHTML = newInnerHtml;
	}

	public onMouseUp(e: MyMouseEvent, ctx: AppContextProps) {
		const layer = ctx.layers[ctx.activeLayer];

		let toPoint = layer.points.findIndex((p) => Point.equals(p, e.gridPos));
		let pointIsNew = false;
		if (toPoint == -1) {
			toPoint = layer.points.push(e.gridPos) - 1;
			pointIsNew = true;
		}

		if (this.activePoint >= 0) {
			//if this is a self-loop, abort
			if (toPoint == this.activePoint) {
				return;
			}
			//if a line already connects these points, update it
			const lineIndex = layer.lines.findIndex((l) =>
				(l.from == this.activePoint && l.to == toPoint) ||
				(l.from == toPoint && l.to == this.activePoint));
			if (lineIndex >= 0) {
				const line = layer.lines[lineIndex];
				ctx.addAction(new UpdateLineAction(ctx.activeLayer, lineIndex, line.thickness, line.color, ctx.lineThickness, ctx.lineColor));
				line.thickness = ctx.lineThickness;
				line.color = ctx.lineColor;
			} else {
				layer.lines.push({ from: this.activePoint, to: toPoint, color: ctx.lineColor, thickness: ctx.lineThickness });
				ctx.addAction(new AddLineAction(ctx.activeLayer, this.activePoint, toPoint, pointIsNew));
			}
		} else {
			ctx.addAction(new AddPointAction(ctx.activeLayer, toPoint));
		}

		const newLayers = ctx.layers.slice(0);
		newLayers[ctx.activeLayer] = { points: layer.points, lines: layer.lines };
		ctx.setLayers(newLayers);

		this.activePoint = toPoint;
	}

	public onPointClick(num: number, ctx: AppContextProps) {
		if (this.activePoint >= 0 && num != this.activePoint) {
			let lines = ctx.layers[ctx.activeLayer].lines;
			lines = lines.concat({ from: this.activePoint, to: num, color: ctx.lineColor, thickness: ctx.lineThickness });
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
