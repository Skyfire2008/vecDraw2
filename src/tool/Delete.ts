class Delete implements Tool {
	private static point = "POINT";
	private static line = "LINE";

	readonly name = "Delete";
	readonly description = "Delete points and lines";
	private deletedItem: { type: string, num: number };
	private pointHover = false;

	constructor() { }

	public onMouseDown(e: MyMouseEvent, ctx: AppContextProps) { }

	public onMouseMove(e: MyMouseEvent, ctx: AppContextProps) {
		const layer = ctx.layers[ctx.activeLayer];

		let pos: Point = null;
		if (this.pointHover) {
			pos = convertCoords(layer.points[this.deletedItem.num], ctx.pan, ctx.zoom, 0);
		} else {
			const pointNum = layer.points.findIndex((p) => Point.equals(p, e.gridPos));
			if (pointNum > -1) {
				pos = convertCoords(e.gridPos, ctx.pan, ctx.zoom, 0);
				this.deletedItem = { type: Delete.point, num: pointNum };
			} else {

				//if not hovering over any points, check lines
				for (let i = 0; i < layer.lines.length; i++) {
					const line = layer.lines[i];

					const maxDist = line.thickness != 0 ? line.thickness : 2;

					//find the projection of vector p0->v onto p0->p1
					const p0 = layer.points[line.from];
					const p1 = layer.points[line.to];
					const v = Point.subtract(p1, p0);
					const foo = Point.subtract(e.shapePos, p0);
					const proj = Point.project(foo, v);

					let t = v.x != 0 ? proj.x / v.x : proj.y / v.y;

					if (!Number.isNaN(t)) {
						let otherPoint: Point;
						if (t < 0) {
							otherPoint = new Point();
						} else if (t > 1) {
							otherPoint = v;
						} else {
							otherPoint = v;
							v.multScalar(t);
						}

						if (Point.distance(otherPoint, foo) < maxDist) {
							pos = convertCoords(Point.sum(otherPoint, p0), ctx.pan, ctx.zoom, 0);
							this.deletedItem = { type: Delete.line, num: i };
							break;
						}
					}
				}
			}
		}

		if (pos != null) {
			ctx.tempGroup.current.innerHTML = `
				<line class="no-mouse-events" stroke-linecap="round" stroke-width="4" stroke="red" x1=${pos.x - 7.5} y1=${pos.y - 7.5} x2=${pos.x + 7.5} y2=${pos.y + 7.5}></line>
				<line class="no-mouse-events" stroke-linecap="round" stroke-width="4" stroke="red" x1=${pos.x + 7.5} y1=${pos.y - 7.5} x2=${pos.x - 7.5} y2=${pos.y + 7.5}></line>
				<line class="no-mouse-events" stroke-linecap="round" stroke-width="2" stroke="white" x1=${pos.x - 5} y1=${pos.y - 5} x2=${pos.x + 5} y2=${pos.y + 5}></line>
				<line class="no-mouse-events" stroke-linecap="round" stroke-width="2" stroke="white" x1=${pos.x + 5} y1=${pos.y - 5} x2=${pos.x - 5} y2=${pos.y + 5}></line>
			`;
		} else {
			ctx.tempGroup.current.innerHTML = "";
		}
	}

	public onMouseUp(e: MyMouseEvent, ctx: AppContextProps) {
		if (this.deletedItem != null) {
			switch (this.deletedItem.type) {
				case Delete.point:
					ctx.addAction(new DeletePoint(ctx.activeLayer, this.deletedItem.num, ctx.layers[ctx.activeLayer].points[this.deletedItem.num]));
					this.pointHover = false;
					break;
				case Delete.line:
					ctx.addAction(new DeleteLine(ctx.activeLayer, this.deletedItem.num));
					break;
			}

			this.deletedItem = null;
		}
		ctx.tempGroup.current.innerHTML = "";
	}

	public onPointEnter(num: number, ctx: AppContextProps) {
		this.deletedItem = { type: Delete.point, num };
		this.pointHover = true;
	}

	public onPointLeave(num: number, ctx: AppContextProps) {
		this.deletedItem = null;
		this.pointHover = false;
	}

	public onEnable(ctx: AppContextProps) { }

	public onDisable(ctx: AppContextProps) {
		this.deletedItem = null;
		this.pointHover = false;
	}
}
