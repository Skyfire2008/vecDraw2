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
			this.points.push(layer.points.length);
			layer.points.push(this.newPoint);
		}
		layer.polygons.push({ points: this.points, color: this.color });

		const newLayers = ctx.layers.slice(0);
		newLayers[this.layerNum] = Object.assign({}, layer);
		ctx.setLayers(newLayers);
	}

	public undo(ctx: AppContextProps): void {
		const layer = ctx.layers[this.layerNum];

		if (this.newPoint != undefined) {
			layer.points.pop();
		}
		layer.polygons.pop();

		const newLayers = ctx.layers.slice(0);
		newLayers[this.layerNum] = Object.assign({}, layer);
		ctx.setLayers(newLayers);
	}
}

class ExpandPolygon implements Action {
	readonly description: ActionKeyWord[];
	readonly layerNum: number;

	private polygon: number;
	private point: number | Point;

	constructor(layer: number, polygon: number, point: number | Point) {
		this.description = [`Added new point to polygon ${polygon}`]
		this.layerNum = layer;
		this.polygon = polygon;
		this.point = point;
	}

	public do(ctx: AppContextProps): void {
		const layer = ctx.layers[this.layerNum];

		let toNum: number;
		if (AddLineAction.isPoint(this.point)) {
			toNum = layer.points.length;
			layer.points.push(this.point);
		} else {
			toNum = this.point;
		}

		layer.polygons[this.polygon].points.push(toNum);

		const newLayers = ctx.layers.slice(0);
		newLayers[this.layerNum] = Object.assign({}, layer);
		ctx.setLayers(newLayers);
	}

	public undo(ctx: AppContextProps): void {

	}
}