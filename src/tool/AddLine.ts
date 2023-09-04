
class AddLine implements Tool {

	readonly name = "AddLine";
	private hoverPoint = -1;
	public activePoint = -1;

	constructor() { }

	public static isAddLine(tool: Tool): tool is AddLine {
		return tool.name == "AddLine";
	}

	public onMouseDown(e: MyMouseEvent, ctx: AppContextProps) {
	}

	public onMouseMove(e: MyMouseEvent, ctx: AppContextProps) {

		//if hovering over a point, attach line to it
		const gridPos = this.hoverPoint < 0 ? e.gridPos : ctx.layers[ctx.activeLayer].points[this.hoverPoint];

		const pos = convertCoords(gridPos, ctx.pan, ctx.zoom, 0);
		let newInnerHtml = `
		<rect class="no-mouse-events" x=${pos.x - 3.5} y=${pos.y - 3.5} width="7" height="7" stroke="black" fill="#00000000"></rect>
		<rect class="no-mouse-events" x=${pos.x - 2.5} y=${pos.y - 2.5} width="5" height="5" stroke="white" fill="none"></rect>`;

		if (this.activePoint >= 0) {
			const activePoint = ctx.layers[ctx.activeLayer].points[this.activePoint];
			const thickness = ctx.lineThickness != 0 ? ctx.lineThickness * ctx.zoom : 2;
			const p1 = convertCoords(activePoint, ctx.pan, ctx.zoom, thickness);
			const p2 = convertCoords(gridPos, ctx.pan, ctx.zoom, thickness);
			newInnerHtml = `<line
				class="no-mouse-events"
				x1=${p1.x} 
				y1=${p1.y} 
				x2=${p2.x} 
				y2=${p2.y} 
				stroke-linecap="round" 
				stroke=${ctx.lineColor} 
				stroke-width=${thickness}>
				</line>` + newInnerHtml;
		}
		ctx.tempGroup.current.innerHTML = newInnerHtml;
	}

	public onMouseUp(e: MyMouseEvent, ctx: AppContextProps) {
		const layer = ctx.layers[ctx.activeLayer];

		//if hovering over a point, use it
		let toPoint: number;
		let pointIsNew = false;
		if (this.hoverPoint > -1) {
			toPoint = this.hoverPoint;
		} else {
			toPoint = layer.points.findIndex((p) => Point.equals(p, e.gridPos));
			if (toPoint == -1) {
				toPoint = layer.points.push(e.gridPos) - 1;
				pointIsNew = true;
			}
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
			if (pointIsNew) {
				ctx.addAction(new AddPointAction(ctx.activeLayer, toPoint));
			}
		}

		const newLayers = ctx.layers.slice(0);
		newLayers[ctx.activeLayer] = { points: layer.points, lines: layer.lines };
		ctx.setLayers(newLayers);

		this.activePoint = toPoint;
	}

	public onPointEnter(num: number, ctx: AppContextProps) {
		this.hoverPoint = num;
	}

	public onPointLeave(num: number, ctx: AppContextProps) {
		this.hoverPoint = -1;
	}

	public onEnable(ctx: AppContextProps) {
		this.activePoint = -1;
	}

	public onDisable(ctx: AppContextProps) {
		ctx.tempGroup.current.innerHTML = "";
	}
}
