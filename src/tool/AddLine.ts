interface AddLinePointSelector extends ToolOption {
	getActivePoint(): number;
	setActivePoint(num: number);
	onAddPoint(num: number);
}

class Polyline implements AddLinePointSelector {
	readonly name = "Polyline";
	readonly description = "Add points connected consecutively";
	private activePoint = -1;

	constructor() { }

	getActivePoint(): number {
		return this.activePoint;
	}

	setActivePoint(num: number) {
		this.activePoint = num;
	}

	onAddPoint(num: number) {
		this.activePoint = num;
	}
}

class StaticPoint implements AddLinePointSelector {
	readonly name = "Single action point";
	readonly description = "Add points connected to single starting point";
	private activePoint = -1;

	constructor() { }

	getActivePoint(): number {
		return this.activePoint;
	}

	setActivePoint(num: number) {
		this.activePoint = num;
	}

	onAddPoint(num: number) {
	}
}

class SeparateLines implements AddLinePointSelector {
	readonly name = "Lines";
	readonly description = "Add points connected pairwise";
	private activePoint = -1;
	private startPoint = true;

	constructor() { }

	getActivePoint(): number {
		return this.activePoint;
	}

	setActivePoint(num: number) {
		this.activePoint = num;
		this.startPoint = true;
	}

	onAddPoint(num: number) {
		this.startPoint = !this.startPoint;
		this.activePoint = this.startPoint ? num : -1;
	}
}

class AddLine implements Tool {

	readonly name = "AddLine";
	readonly description = "Add points connected by lines/connect existing points";
	readonly options: Array<AddLinePointSelector> = [
		new Polyline(), new StaticPoint(), new SeparateLines()
	];
	private hoverPoint = -1;
	private selectorInd = 0;
	public selector: AddLinePointSelector = this.options[this.selectorInd];

	constructor() { }

	public getOptionInd(): number {
		return this.selectorInd;
	}

	public setOptionInd(num: number) {
		//assume that num is valid
		this.selectorInd = num;
		this.selector = this.options[num];
		this.selector.onAddPoint(-1);
	}

	public static isAddLine(tool: Tool): tool is AddLine {
		return tool.name == "AddLine";
	}

	public onMouseDown(e: MyMouseEvent, ctx: AppContextProps) {
	}

	public onMouseMove(e: MyMouseEvent, ctx: AppContextProps) {

		//if hovering over a point, attach line to it
		const gridPos = this.hoverPoint < 0 ? e.gridPos : ctx.layers[ctx.activeLayer].points[this.hoverPoint];

		const pos = convertCoords(gridPos, ctx.pan, ctx.zoom, 0);
		let newInnerHtml = `<use href="#point" class="no-mouse-events" x=${pos.x} y=${pos.y}></use>`;

		if (this.selector.getActivePoint() >= 0) {
			const activePoint = ctx.layers[ctx.activeLayer].points[this.selector.getActivePoint()];
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
				toPoint = layer.points.length;
				pointIsNew = true;
			}
		}

		if (this.selector.getActivePoint() >= 0) {
			//if this is a self-loop, abort
			if (toPoint == this.selector.getActivePoint()) {
				return;
			}

			//if a line already connects these points, update it
			const lineIndex = layer.lines.findIndex((l) =>
				(l.from == this.selector.getActivePoint() && l.to == toPoint) ||
				(l.from == toPoint && l.to == this.selector.getActivePoint()));

			if (lineIndex >= 0) {
				ctx.addAction(new UpdateLineAction(ctx.activeLayer, lineIndex, ctx.lineThickness, ctx.lineColor));
			} else {
				ctx.addAction(new AddLineAction(ctx.activeLayer, this.selector.getActivePoint(), pointIsNew ? e.gridPos : toPoint, ctx.lineThickness, ctx.lineColor));
				this.selector.onAddPoint(toPoint);
			}
		} else {
			//no active point - set active point
			if (pointIsNew) {
				ctx.addAction(new AddPointAction(ctx.activeLayer, e.gridPos));
			}

			this.selector.setActivePoint(toPoint);
		}
	}

	public onPointEnter(num: number, ctx: AppContextProps) {
		this.hoverPoint = num;
	}

	public onPointLeave(num: number, ctx: AppContextProps) {
		this.hoverPoint = -1;
	}

	public onEnable(ctx: AppContextProps) {
		this.selector.setActivePoint(-1);
	}

	public onDisable(ctx: AppContextProps) {
		ctx.tempGroup.current.innerHTML = "";
	}
}
