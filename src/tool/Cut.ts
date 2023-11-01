interface CutType {
	lineNum: number,
	point: Point
}

class Cut implements Tool {
	readonly name = "Cut";
	readonly description = "Adds new points to line on intersection";
	private cutting = false;
	private startPos: Point;
	private endPos: Point;
	private intersections: Array<CutType>;

	constructor() { }

	public onMouseDown(e: MyMouseEvent, ctx: AppContextProps) {
		if (this.startPos == null) {
			this.startPos = e.gridPos;
		}
		this.cutting = true;
	}

	public onMouseMove(e: MyMouseEvent, ctx: AppContextProps) {
		if (this.cutting) {

			//TODO: skip if end point didn't change

			const endPos = this.endPos != null ? this.endPos : e.gridPos;

			let newInnerHtml = AddLine.drawLineToHtml(this.startPos, endPos, ctx, 1, "#ff0000");

			const layer = ctx.layers[ctx.activeLayer];

			this.intersections = [];
			for (let i = 0; i < layer.lines.length; i++) {
				const line = layer.lines[i];
				const intersection = segmentIntersection(layer.points[line.from], layer.points[line.to], this.startPos, endPos);
				if (intersection != null) {
					this.intersections.push({ lineNum: i, point: intersection });
					const foo = convertCoords(intersection, ctx.pan, ctx.zoom, 0);
					newInnerHtml += `<use href="#point" class="no-mouse-events" x=${foo.x} y=${foo.y}></use>`;
				}
			}

			window.requestAnimationFrame(() => {
				ctx.tempGroup.current.innerHTML = newInnerHtml;
			});
		}
	}

	public onMouseUp(e: MyMouseEvent, ctx: AppContextProps) {

		ctx.addAction(new CutLine(ctx.activeLayer, this.intersections));

		//cleanup
		ctx.tempGroup.current.innerHTML = "";
		this.cutting = false;
		this.startPos = null;
		this.endPos = null;
		this.intersections = [];
	}

	public onPointEnter(num: number, ctx: AppContextProps) {
		const layer = ctx.layers[ctx.activeLayer];

		if (this.cutting) {
			this.endPos = layer.points[num];
		} else {
			this.startPos = layer.points[num];
		}
	}

	public onPointLeave(num: number, ctx: AppContextProps) {
		if (this.cutting) {
			this.endPos = null;
		} else {
			this.startPos = null;
		}
	}
}