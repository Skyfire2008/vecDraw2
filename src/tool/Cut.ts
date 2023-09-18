class Cut implements Tool {
	readonly name = "Cut";
	readonly description = "Adds new points to line on intersection";
	private cutting = false;
	private startPos: Point;
	private endPos: Point;
	private intersections: Array<{ lineNum: number, point: Point }>;

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

			const p1 = convertCoords(this.startPos, ctx.pan, ctx.zoom, 1);
			const p2 = convertCoords(endPos, ctx.pan, ctx.zoom, 1);
			ctx.tempGroup.current.innerHTML = `<line
			class="no-mouse-events"
			x1=${p1.x} 
			y1=${p1.y} 
			x2=${p2.x} 
			y2=${p2.y} 
			stroke-linecap="round" 
			stroke="#ff0000" 
			stroke-width=${1}>
			</line>`;

			const layer = ctx.layers[ctx.activeLayer];

			this.intersections = [];
			for (let i = 0; i < layer.lines.length; i++) {
				const line = layer.lines[i];
				const intersection = segmentIntersection(layer.points[line.from], layer.points[line.to], this.startPos, endPos);
				if (intersection != null) {
					this.intersections.push({ lineNum: i, point: intersection });
					const foo = convertCoords(intersection, ctx.pan, ctx.zoom, 0);
					ctx.tempGroup.current.innerHTML += `<use href="#point" class="no-mouse-events" x=${foo.x} y=${foo.y}></use>`;
				}
			}
		}
	}

	public onMouseUp(e: MyMouseEvent, ctx: AppContextProps) {
		const layer = ctx.layers[ctx.activeLayer];

		//TODO: add action instead
		for (const intersection of this.intersections) {
			const pointNum = layer.points.push(intersection.point) - 1;
			const line = layer.lines[intersection.lineNum];
			const temp = line.to;
			layer.lines[intersection.lineNum].to = pointNum;
			layer.lines.push({ from: pointNum, to: temp, color: line.color, thickness: line.thickness });
		}
		ctx.layers[ctx.activeLayer] = { points: layer.points, lines: layer.lines };
		ctx.setLayers(ctx.layers.slice(0));

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