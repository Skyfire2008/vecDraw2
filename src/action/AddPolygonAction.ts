class AddPolygonAction implements Action {
	readonly description: ActionKeyWord[];
	readonly layerNum: number;

	private points: Array<number>;
	private newPoint: Point;
	private color: string;

	constructor(layer: number, color: string, points: Array<number>, newPoint?: Point) {
		this.description = ["Added polygon on layer ${layer} from points", ...points.map((p) => { return { pointNum: p } })];
		this.layerNum = layer;

		this.color = color;
		this.points = points.slice(0);
		this.newPoint = newPoint;
	}

	public do(ctx: AppContextProps): void {
		const layer = ctx.layers[this.layerNum];

		if (this.newPoint != undefined) {
			layer.points.push(this.newPoint);
			this.points.push(layer.points.length - 1);
		}

		layer.polygons.push({ points: this.points, color: this.color });

		const newLayers = ctx.layers.slice(0);
		newLayers[this.layerNum] = Object.assign({}, layer);
		ctx.setLayers(newLayers);
	}

	public undo(ctx: AppContextProps): void {
		const layer = ctx.layers[this.layerNum];

		let pointNum = -1;
		if (this.newPoint != undefined) {
			layer.points.pop();
			pointNum = layer.points.length - 1;
		}
		layer.polygons.pop();

		if (AddPolygon.isAddPolygon(ctx.tool)) {
			const toolState = ctx.tool.getState();
			if (toolState.polygonNum == layer.polygons.length) {

				//if current polygon is being edited, revert activepoints and polygonNum
				toolState.activePoints[1] = this.points[1];
				toolState.polygonNum = -1;
			} else {

				//otherwise just ensure that activePoints doesn't have deleted points
				const ind = toolState.activePoints.findIndex((item) => item == pointNum);
				if (ind > -1) {
					toolState.activePoints.splice(ind, 1);
				}
			}

			if (toolState.hoverPoint == pointNum) {
				toolState.hoverPoint = -1;
			}

			ctx.tool.setState(toolState);
		}

		const newLayers = ctx.layers.slice(0);
		newLayers[this.layerNum] = Object.assign({}, layer);
		ctx.setLayers(newLayers);
	}
}

class ExpandPolygon implements Action {
	readonly description: ActionKeyWord[];
	readonly layerNum: number;

	private polygonNum: number;
	private point: number | Point;

	constructor(layer: number, polygonNum: number, point: number | Point) {
		this.description = [`Added new point to polygon ${polygonNum}`]
		this.layerNum = layer;
		this.polygonNum = polygonNum;
		this.point = point;
	}

	public do(ctx: AppContextProps): void {
		const layer = ctx.layers[this.layerNum];
		const polygon = layer.polygons[this.polygonNum];

		let pointNum: number;
		if (AddLineAction.isPoint(this.point)) {//if point is new, first add it to point array
			pointNum = layer.points.length;
			layer.points.push(this.point);
		} else {
			pointNum = this.point;
		}
		polygon.points.push(pointNum);

		const newLayers = ctx.layers.slice(0);
		newLayers[this.layerNum] = Object.assign({}, layer);
		ctx.setLayers(newLayers);
	}

	public undo(ctx: AppContextProps): void {
		const layer = ctx.layers[this.layerNum];
		const polygon = layer.polygons[this.polygonNum];

		let pointNum = -1;
		if (AddLineAction.isPoint(this.point)) {
			layer.points.pop();
			pointNum = layer.points.length;
		}
		polygon.points.pop();

		if (AddPolygon.isAddPolygon(ctx.tool)) {
			const toolState = ctx.tool.getState();
			if (toolState.polygonNum == this.polygonNum) {

				//if current polygon is being undone, revert activePoints to previous state
				toolState.activePoints[1] = polygon.points[polygon.points.length - 1];
			} else {

				//otherwise just ensure that activePoints doesn't have deleted points
				const ind = toolState.activePoints.findIndex((item) => item == pointNum);
				if (ind > -1) {
					toolState.activePoints.splice(ind, 1);
				}
			}

			if (toolState.hoverPoint == pointNum) {
				toolState.hoverPoint = -1;
			}

			ctx.tool.setState(toolState);
		}

		const newLayers = ctx.layers.slice(0);
		newLayers[this.layerNum] = Object.assign({}, layer);
		ctx.setLayers(newLayers);
	}
}