class AddPolygon implements Tool {

	readonly name = "AddPolygon";
	readonly description = "Add a polygon";

	private polygonNum: number = -1;
	private activePoints: Array<number> = [];
	private hoverPoint = -1;

	public static isAddPolygon(tool: Tool): tool is AddPolygon {
		return tool.name == AddPolygon.name;
	}

	constructor() {

	}

	public onMouseDown(e: MyMouseEvent, ctx: AppContextProps) {
	}

	public onMouseMove(e: MyMouseEvent, ctx: AppContextProps) {

		const gridPos = this.hoverPoint < 0 ? e.gridPos : ctx.layers[ctx.activeLayer].points[this.hoverPoint];

		const pos = convertCoords(gridPos, ctx.pan, ctx.zoom, 0);
		let newInnerHtml = `<use href="#point" class="no-mouse-events" x=${pos.x} y=${pos.y}></use>`;

		if (this.activePoints[0] != undefined) {
			const activePoint = ctx.layers[ctx.activeLayer].points[this.activePoints[0]];
			newInnerHtml = AddLine.drawLineToHtml(gridPos, activePoint, ctx, 1, ctx.lineColor) + newInnerHtml;
		}

		if (this.activePoints[1] != undefined) {
			const activePoint = ctx.layers[ctx.activeLayer].points[this.activePoints[1]];
			newInnerHtml = AddLine.drawLineToHtml(gridPos, activePoint, ctx, 1, ctx.lineColor) + newInnerHtml;
		}

		window.requestAnimationFrame(() => {
			ctx.tempGroup.current.innerHTML = newInnerHtml;
		});
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
				toPoint = layer.points.length;
				pointIsNew = true;
			}
		}

		if (this.activePoints.length == 0) {//if no active points, just create a point
			if (pointIsNew) {
				ctx.addAction(new AddPointAction(ctx.activeLayer, e.gridPos));
			}

			this.activePoints[0] = toPoint;

		} else if (this.activePoints.length == 1) { //if 1 active point - create line

			//skip if self-loop
			if (toPoint == this.activePoints[0]) {
				return;
			}

			//if a line already connects these points, update it
			const lineIndex = layer.lines.findIndex((l) =>
				(l.from == this.activePoints[0] && l.to == toPoint) ||
				(l.from == toPoint && l.to == this.activePoints[0]));

			//TODO: do not add a line here
			if (lineIndex >= 0) {
				ctx.addAction(new UpdateLineAction(ctx.activeLayer, lineIndex, ctx.lineThickness, ctx.lineColor));
			} else {
				ctx.addAction(new AddLineAction(ctx.activeLayer, this.activePoints[0], pointIsNew ? e.gridPos : toPoint, ctx.lineThickness, ctx.lineColor));
			}

			this.activePoints[1] = toPoint;
		} else {

			//create polygon
			if (this.polygonNum < 0) {
				const points = pointIsNew ? this.activePoints : [this.activePoints[0], toPoint, this.activePoints[1]];
				this.polygonNum = layer.polygons.length;
				ctx.addAction(new AddPolygonAction(ctx.activeLayer, ctx.lineColor, points, pointIsNew ? e.gridPos : null));
			} else {
				ctx.addAction(new ExpandPolygon(ctx.activeLayer, this.polygonNum, pointIsNew ? e.gridPos : toPoint));
			}

			this.activePoints.push(toPoint);
			this.activePoints.shift();
		}
	}

	public onPointEnter(num: number, ctx: AppContextProps) {
		this.hoverPoint = num;
	}

	public onPointLeave(num: number, ctx: AppContextProps) {
		this.hoverPoint = -1;
	}

	public onEnable(ctx: AppContextProps) {
		this.activePoints = [];
		this.polygonNum = -1;
	}

	public onDisable(ctx: AppContextProps) {
		ctx.tempGroup.current.innerHTML = "";
	}
}