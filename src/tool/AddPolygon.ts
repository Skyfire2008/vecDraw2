namespace tool {

	interface AddPolygonState {
		polygonNum: number;
		activePoints: Array<number>;
		hoverPoint: number;
	}

	export class AddPolygon implements Tool {

		readonly name = "AddPolygon";
		readonly description = "Add a polygon";
		private activePoints: Array<number> = [];
		private polygonNum: number = -1;

		private hoverPoint = -1;

		public static isAddPolygon(tool: Tool): tool is AddPolygon {
			return tool.name == AddPolygon.name;
		}

		constructor() { }

		public getState(): AddPolygonState {
			return { polygonNum: this.polygonNum, activePoints: this.activePoints, hoverPoint: this.hoverPoint };
		}

		public setState(state: AddPolygonState) {
			this.polygonNum = state.polygonNum;
			this.activePoints = state.activePoints;
			this.hoverPoint = state.hoverPoint;
		}

		public onMouseDown(e: MyMouseEvent, ctx: ui.AppContextProps) {
		}

		public onMouseMove(e: MyMouseEvent, ctx: ui.AppContextProps) {
			const layer = ctx.layers[ctx.activeLayer];

			const hoverPointValid = 0 < this.hoverPoint && this.hoverPoint < ctx.layers[ctx.activeLayer].points.length;
			const gridPos = hoverPointValid ? ctx.layers[ctx.activeLayer].points[this.hoverPoint] : e.gridPos;

			const pos = ui.convertCoords(gridPos, ctx.pan, ctx.zoom, 0);
			let newInnerHtml = `<use href="#point" class="no-mouse-events" x=${pos.x} y=${pos.y}></use>`;

			let points: Array<math.Point> = [];
			if (this.activePoints[0] != null) {
				points.push(layer.points[this.activePoints[0]]);
			}

			points.push(gridPos);

			if (this.activePoints[1] != null) {
				points.push(layer.points[this.activePoints[1]]);
			}

			if (this.polygonNum == -1 && this.activePoints[1] != null) {
				points.push(layer.points[this.activePoints[0]]);
			}

			let coordString = "";
			for (const p of points) {
				const foo = ui.convertCoords(p, ctx.pan, ctx.zoom, 1);
				coordString += `${foo.x},${foo.y} `;
			}

			newInnerHtml = `<polyline points="${coordString}" fill="none" stroke="white" stroke-width="1" stroke-linecap="round" stroke-dasharray="10 6"></polyline>` + newInnerHtml;
			newInnerHtml = `<polyline points="${coordString}" fill="none" stroke="black" stroke-width="3" stroke-linecap="round" stroke-dasharray="10 6"></polyline>` + newInnerHtml;

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

			if (this.activePoints.length < 2) {//if less than 2 active points, just create a point

				//prevent self-loops...
				if (this.activePoints.indexOf(toPoint) < 0) {
					if (pointIsNew) {
						ctx.addAction(new action.AddPointAction(ctx.activeLayer, e.gridPos));
					}
					this.activePoints.push(toPoint);
				}
			} else {//otherwise, create or expand polygon

				//if polygonNum negative, create a new polygon
				if (this.polygonNum < 0) {
					if (pointIsNew) {

						//if point is new, just create a polygon
						ctx.addAction(new action.AddPolygonAction(ctx.activeLayer, ctx.lineColor, this.activePoints, e.gridPos));
						this.polygonNum = layer.polygons.length - 1;
						this.activePoints[1] = layer.points.length - 1;
					} else {

						//otherwise, check that no self-loop occurs
						if (this.activePoints.indexOf(toPoint) < 0) {
							const points = [this.activePoints[0], this.activePoints[1], toPoint];
							this.polygonNum = layer.polygons.length;
							ctx.addAction(new action.AddPolygonAction(ctx.activeLayer, ctx.lineColor, points));
						}
					}
				} else {

					//otherwise expand existing polygon
					if (pointIsNew) {
						ctx.addAction(new action.ExpandPolygon(ctx.activeLayer, this.polygonNum, e.gridPos));
						this.activePoints[1] = layer.points.length - 1;
					} else {
						const polygon = layer.polygons[this.polygonNum];
						if (polygon.points.indexOf(toPoint) < 0) {
							ctx.addAction(new action.ExpandPolygon(ctx.activeLayer, this.polygonNum, toPoint));
							this.activePoints[1] = toPoint;
						}
					}

				}
			}
		}

		public onPointEnter(num: number, ctx: ui.AppContextProps) {
			this.hoverPoint = num;
		}

		public onPointLeave(num: number, ctx: ui.AppContextProps) {
			this.hoverPoint = -1;
		}

		public onEnable(ctx: ui.AppContextProps) {
			this.activePoints = [];
			this.polygonNum = -1;
		}

		public onDisable(ctx: ui.AppContextProps) {
			ctx.tempGroup.current.innerHTML = "";
		}
	}
}