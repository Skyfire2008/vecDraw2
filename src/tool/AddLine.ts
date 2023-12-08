namespace tool {

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

	export class AddLine implements Tool {

		readonly name = "AddLine";
		readonly description = "Add points connected by lines/connect existing points";
		readonly options: Array<AddLinePointSelector> = [
			new Polyline(), new StaticPoint(), new SeparateLines()
		];
		private hoverPoint = -1;
		private selectorInd = 0;
		public selector: AddLinePointSelector = this.options[this.selectorInd];

		/**
		 * Generates html for temporary line
		 * @param from from point index
		 * @param to to point index
		 * @param ctx app context
		 * @param thickness line thickness
		 * @param color line color
		 */
		public static drawLineToHtml(from: math.PointLike, to: math.PointLike, ctx: ui.AppContextProps, thickness: number, color: string): string {
			const p1 = ui.convertCoords(from, ctx.pan, ctx.zoom, thickness);
			const p2 = ui.convertCoords(to, ctx.pan, ctx.zoom, thickness);

			return `<line
		class="no-mouse-events"
		x1=${p1.x} 
		y1=${p1.y} 
		x2=${p2.x} 
		y2=${p2.y} 
		stroke-linecap="round" 
		stroke=${color} 
		stroke-width=${thickness}>
		</line>`;
		}

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
			return tool.name == AddLine.name;
		}

		public onMouseDown(e: MyMouseEvent, ctx: ui.AppContextProps) {
		}

		public onMouseMove(e: MyMouseEvent, ctx: ui.AppContextProps) {

			//if hovering over a point, attach line to it
			const gridPos = this.hoverPoint < 0 ? e.gridPos : ctx.layers[ctx.activeLayer].points[this.hoverPoint];

			const pos = ui.convertCoords(gridPos, ctx.pan, ctx.zoom, 0);
			let newInnerHtml = `<use href="#point" class="no-mouse-events" x=${pos.x} y=${pos.y}></use>`;

			if (this.selector.getActivePoint() >= 0) {
				const activePoint = ctx.layers[ctx.activeLayer].points[this.selector.getActivePoint()];
				const thickness = ctx.lineThickness != 0 ? ctx.lineThickness * ctx.zoom : 2;
				newInnerHtml = AddLine.drawLineToHtml(activePoint, gridPos, ctx, thickness, ctx.lineColor) + newInnerHtml;
			}

			window.requestAnimationFrame(() => {
				ctx.tempGroup.current.innerHTML = newInnerHtml;
			});
		}

		public onMouseUp(e: MyMouseEvent, ctx: ui.AppContextProps) {
			const layer = ctx.layers[ctx.activeLayer];

			//if hovering over a point, use it
			let toPoint: number;
			let pointIsNew = false;
			if (this.hoverPoint > -1) {
				toPoint = this.hoverPoint;
			} else {
				toPoint = layer.points.findIndex((p) => math.Point.equals(p, e.gridPos));
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
					ctx.addAction(new action.UpdateLineAction(ctx.activeLayer, lineIndex, ctx.lineThickness, ctx.lineColor));
				} else {
					ctx.addAction(new action.AddLineAction(ctx.activeLayer, this.selector.getActivePoint(), pointIsNew ? e.gridPos : toPoint, ctx.lineThickness, ctx.lineColor));
				}

				this.selector.onAddPoint(toPoint);
			} else {
				//no active point - set active point
				if (pointIsNew) {
					ctx.addAction(new action.AddPointAction(ctx.activeLayer, e.gridPos));
				}

				this.selector.setActivePoint(toPoint);
			}
		}

		public onPointEnter(num: number, ctx: ui.AppContextProps) {
			this.hoverPoint = num;
		}

		public onPointLeave(num: number, ctx: ui.AppContextProps) {
			this.hoverPoint = -1;
		}

		public onEnable(ctx: ui.AppContextProps) {
			this.selector.setActivePoint(-1);
		}

		public onDisable(ctx: ui.AppContextProps) {
			ctx.tempGroup.current.innerHTML = "";
		}
	}
}