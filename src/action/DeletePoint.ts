class DeletePoint implements Action {
	readonly description: Array<ActionKeyWord>;
	readonly layerNum: number;
	private pointNum: number;
	private point: Point;
	private deletedLines: Array<{ line: Line, num: number }> = []; //also store their position in array to preserve order when undoing
	private deletedPolygons: Array<{ num: number, polygon: Polygon, deleted: boolean }> = [];

	constructor(layerNum: number, pointNum: number, point: Point) {
		this.layerNum = layerNum;
		this.pointNum = pointNum;
		this.point = point;
		this.description = ["Removed point ", { pointNum }];
	}

	public do(ctx: AppContextProps) {
		const layer = ctx.layers[ctx.activeLayer];

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
				if (newPolygon.points.length < 3) {
					this.deletedPolygons.push({ num: i, polygon, deleted: true });
				} else {
					this.deletedPolygons.push({ num: i, polygon, deleted: false });
					newPolygons.push(newPolygon);
				}

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
		let i = 0, j = 0;
		for (let k = 0; k < layer.lines.length + this.deletedLines.length; k++) {
			const line = layer.lines[i];
			const deletedLine = this.deletedLines[j];

			if (deletedLine?.num == k) {
				//if reached position where current deleted line was, restore it
				newLines.push(deletedLine.line);
				j++;
			} else {
				//otherwise just restore line endpoints
				if (line.from >= this.pointNum) {
					line.from++;
				}
				if (line.to >= this.pointNum) {
					line.to++;
				}

				newLines.push(line);
				i++;
			}
		}

		const newPolygons: Array<Polygon> = layer.polygons.slice(0);
		let offset = 0;
		for (const polygon of this.deletedPolygons) {
			if (!polygon.deleted) {
				newPolygons[polygon.num - offset] = polygon.polygon;
			} else {
				newPolygons.splice(polygon.num - offset, 0, polygon.polygon);
				offset++;
			}
		}

		ctx.layers[ctx.activeLayer] = { lines: newLines, polygons: newPolygons, points: layer.points.slice(0) };
		ctx.setLayers(ctx.layers.slice(0));
	}
}
