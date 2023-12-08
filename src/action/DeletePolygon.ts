namespace action {

	export class DeletePolygon implements Action {
		readonly description: Array<ActionKeyWord>;
		readonly layerNum: number;

		private polygonNum: number;
		private deletedPolygon: types.Polygon;

		constructor(layerNum: number, polygonNum: number) {
			this.description = [`Deleted polygon ${polygonNum}`];
			this.layerNum = layerNum;
			this.polygonNum = polygonNum;
		}

		public do(ctx: ui.AppContextProps): void {
			const layer = ctx.layers[this.layerNum];

			this.deletedPolygon = layer.polygons.splice(this.polygonNum, 1)[0];
			ctx.layers[this.layerNum] = Object.assign({}, layer, { polygons: layer.polygons.slice(0) });
			ctx.setLayers(ctx.layers.slice(0));
		}

		public undo(ctx: ui.AppContextProps): void {
			const layer = ctx.layers[this.layerNum];

			layer.polygons.splice(this.polygonNum, 0, this.deletedPolygon);
			ctx.layers[this.layerNum] = Object.assign({}, layer, { polygons: layer.polygons.slice(0) });
			ctx.setLayers(ctx.layers.slice(0));
		}
	}
}