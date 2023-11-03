interface AddPolygonOption extends ToolOption {
	/**
	 * To be called on Add/Expand PolygonAction do
	 * @param points points of polygon
	 * @param point new point to be added
	 */
	do(points: Array<number>, point: number): void;
	undo(): void;
}

class TriangleFan implements AddPolygonOption {
	public readonly name = "Triangle Fan";
	public readonly description = "New points are connected to previous and starting point";
	private readonly activePoints: Array<number>;

	constructor(activePoints: Array<number>) {
		this.activePoints = activePoints;
	}

	public do(points: Array<number>, point: number) {
		if (points == null || points.length < 2) {
			this.activePoints.push(point);
		} else {
			if (point != null) {
				points.push(point);
			}
			this.activePoints[1] = point;
		}
	}

	public undo() {
		
	}
}

class TriangleStrip implements AddPolygonOption {
	public readonly name = "Triangle Strip";
	public readonly description = "New points are connected to 2 previous points";
	private readonly activePoints: Array<number>;

	constructor(activePoints: Array<number>) {
		this.activePoints = activePoints;
	}

	public do(points: Array<number>, point: number) {
		if (points == null || points.length < 2) {
			this.activePoints.push(point);
		} else {
			if (point != null) {
				if (points.length % 2 == 0) {
					points.push(point);
				} else {
					points.unshift(points.pop());
					points.push(point);
				}
			}
			this.activePoints.push(point);
			this.activePoints.shift();
		}
	}

	public undo() { }
}


class AddPolygon implements Tool {

	readonly name = "AddPolygon";
	readonly description = "Add a polygon";
	private readonly activePoints: Array<number> = [];
	private polygonNum: number = -1;

	private hoverPoint = -1;

	readonly options = [new TriangleFan(this.activePoints), new TriangleStrip(this.activePoints)];
	private optionInd = 0;
	private option = this.options[this.optionInd];

	public static isAddPolygon(tool: Tool): tool is AddPolygon {
		return tool.name == AddPolygon.name;
	}

	constructor() {

	}

	public getOptionInd(): number {
		return this.optionInd;
	}

	public setOptionInd(num: number) {
		this.optionInd = num;
		this.option = this.options[this.optionInd];
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

		if (this.activePoints.length < 2) {//if less than 2 active points, just create a point

			//prevent self-loops...
			if (this.activePoints.indexOf(toPoint) < 0) {
				if (pointIsNew) {
					ctx.addAction(new AddPointAction(ctx.activeLayer, e.gridPos));
				}
				this.activePoints.push(toPoint);
			}
		} else {//otherwise, create or expand polygon

			if (this.polygonNum < 0) {
				if (pointIsNew) {
					//if point is new, just create a polygon
					this.polygonNum = layer.polygons.length;
					ctx.addAction(new AddPolygonAction(ctx.activeLayer, ctx.lineColor, this.activePoints, this.option, e.gridPos));
				} else {
					//otherwise, check that no self-loop occurs
					if (this.activePoints.indexOf(toPoint) < 0) {
						const points = [this.activePoints[0], this.activePoints[1], toPoint];
						this.polygonNum = layer.polygons.length;
						ctx.addAction(new AddPolygonAction(ctx.activeLayer, ctx.lineColor, points, this.option));
					}
				}
			} else {

				if (pointIsNew) {
					ctx.addAction(new ExpandPolygon(ctx.activeLayer, this.polygonNum, e.gridPos, this.option));
				} else {
					const polygon = layer.polygons[this.polygonNum];
					if (polygon.points.indexOf(toPoint) < 0) {
						ctx.addAction(new ExpandPolygon(ctx.activeLayer, this.polygonNum, toPoint, this.option));
					}
				}

			}
		}
	}

	public onPointEnter(num: number, ctx: AppContextProps) {
		this.hoverPoint = num;
	}

	public onPointLeave(num: number, ctx: AppContextProps) {
		this.hoverPoint = -1;
	}

	public onEnable(ctx: AppContextProps) {
		this.activePoints.splice(0, this.activePoints.length);
		this.polygonNum = -1;
	}

	public onDisable(ctx: AppContextProps) {
		ctx.tempGroup.current.innerHTML = "";
	}
}