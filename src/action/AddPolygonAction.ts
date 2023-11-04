class AddPolygonAction implements Action {
	readonly description: ActionKeyWord[];
	readonly layerNum: number;

	private points: Array<number>;
	private newPoint: Point;
	private color: string;
	private option: AddPolygonOption;

	constructor(layer: number, color: string, points: Array<number>, option: AddPolygonOption, newPoint?: Point) {
		this.description = ["Added polygon on layer ${layer} from points", ...points.map((p) => { return { pointNum: p } })];
		this.layerNum = layer;

		this.color = color;
		this.points = points.slice(0);
		this.newPoint = newPoint;
		this.option = option;
	}

	public do(ctx: AppContextProps): void {
		const layer = ctx.layers[this.layerNum];

		if (this.newPoint != undefined) {
			this.option.do(this.points, layer.points.length);
			layer.points.push(this.newPoint);
		} else {
			this.option.do(this.points, null);
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
			this.option.undo(this.points, layer.points.length);
		} else {
			this.option.undo(this.points, null);
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

	private polygonNum: number;
	private point: number | Point;
	private option: AddPolygonOption;

	constructor(layer: number, polygonNum: number, point: number | Point, option: AddPolygonOption) {
		this.description = [`Added new point to polygon ${polygonNum}`]
		this.layerNum = layer;
		this.polygonNum = polygonNum;
		this.point = point;
		this.option = option;
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

		this.option.do(layer.polygons[this.polygonNum].points, toNum);

		const newLayers = ctx.layers.slice(0);
		newLayers[this.layerNum] = Object.assign({}, layer);
		ctx.setLayers(newLayers);
	}

	public undo(ctx: AppContextProps): void {
		const layer = ctx.layers[this.layerNum];
		const polygon = layer.polygons[this.polygonNum];

		let toNum: number;
		if (AddLineAction.isPoint(this.point)) {
			layer.points.pop();
			toNum = layer.points.length;
		} else {
			toNum = this.point;
		}
		this.option.undo(polygon.points, toNum);

		const newLayers = ctx.layers.slice(0);
		newLayers[this.layerNum] = Object.assign({}, layer);
		ctx.setLayers(newLayers);
	}
}