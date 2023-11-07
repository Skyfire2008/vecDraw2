class DeletePoint implements Action {
	readonly description: Array<ActionKeyWord>;
	readonly layerNum: number;
	private pointNum: number;
	private point: Point;
	private deletedLines: Array<{ line: Line, num: number }> = []; //also store their position in array to preserve order when undoing
	private deletedPolygons: Array<{ num: number, polygon: Polygon }> = [];
	private totalPolygons: number;

	constructor(layerNum: number, pointNum: number, point: Point) {
		this.layerNum = layerNum;
		this.pointNum = pointNum;
		this.point = point;
		this.description = ["Removed point ", { pointNum }];
	}

	public do(ctx: AppContextProps) {
		const layer = ctx.layers[ctx.activeLayer];
		this.totalPolygons = layer.polygons.length;

		layer.points.splice(this.pointNum, 1);

		const newLines: Array<Line> = [];
		for (let i = 0; i < layer.lines.length; i++) {
			const line = layer.lines[i];

			if (line.from == this.pointNum || line.to == this.pointNum) {
				this.deletedLines.push({ line, num: i });
			} else {
				//decrement line end point by 1 since removal of point shifted everything by -1
				if (line.from > this.pointNum) {
					line.from--;
				}
				if (line.to > this.pointNum) {
					line.to--;
				}
				newLines.push(line);
			}
		}

		//filter the deleted point from polygons
		const newPolygons: Array<Polygon> = [];
		for (let i = 0; i < layer.polygons.length; i++) {
			const polygon = layer.polygons[i];
			const newPolygon: Polygon = { color: polygon.color, points: [] };

			let changed = false;
			for (const point of polygon.points) {
				if (point > this.pointNum) {
					newPolygon.points.push(point - 1);
					changed = true;
				} else if (point != this.pointNum) {
					newPolygon.points.push(point);
					changed = true;
				}
			}

			if (changed) {
				//delete polygon completely if number of points<3
				if (newPolygon.points.length > 2) {
					newPolygons.push(newPolygon);
				}

				this.deletedPolygons.push({ num: i, polygon });
			} else {
				newPolygons.push(newPolygon);
			}
		}

		ctx.layers[ctx.activeLayer] = { lines: newLines, polygons: newPolygons, points: layer.points.slice(0) };
		ctx.setLayers(ctx.layers.slice(0));
	}

	public undo(ctx: AppContextProps) {
		const layer = ctx.layers[ctx.activeLayer];

		//put the point back
		layer.points.splice(this.pointNum, 0, this.point);

		const newLines: Array<Line> = [];
		let delInd = 0;
		let oldInd = 0;
		for (let i = 0; i < layer.lines.length + this.deletedLines.length; i++) {
			const delLine = this.deletedLines[delInd];

			if (delLine?.num == i) {
				//if reached position where current deleted line was, restore it
				newLines.push(delLine.line);
				delInd++;
			} else {
				//otherwise just restore line endpoints
				const line = layer.lines[oldInd];

				if (line.from >= this.pointNum) {
					line.from++;
				}
				if (line.to >= this.pointNum) {
					line.to++;
				}

				newLines.push(line);
				oldInd++;
			}
		}

		const newPolygons: Array<Polygon> = [];
		delInd = 0;
		oldInd = 0;
		for (let i = 0; i < this.totalPolygons; i++) {
			const delPolygon = this.deletedPolygons[delInd];

			if (delPolygon?.num == i) {
				newPolygons.push(delPolygon.polygon);
				delInd++;
			} else {
				newPolygons.push(layer.polygons[oldInd]);
				oldInd++;
			}

			/*if (!polygon.deleted) {
				newPolygons[polygon.num - offset] = polygon.polygon;
			} else {
				newPolygons.splice(polygon.num - offset, 0, polygon.polygon);
				offset++;
			}*/
		}

		ctx.layers[ctx.activeLayer] = { lines: newLines, polygons: newPolygons, points: layer.points.slice(0) };
		ctx.setLayers(ctx.layers.slice(0));
	}
}
