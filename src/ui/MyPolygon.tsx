namespace ui {

	interface MyPolygonProps {
		layer: number;
		num: number;
		polygon: types.Polygon;
	}

	export const MyPolygon: React.FC<MyPolygonProps> = ({ layer, num, polygon }) => {
		const ctx = React.useContext(AppContext);
		const myLayer = ctx.layers[layer];
		const tool = ctx.tool;

		let pointString = "";
		for (const p of polygon.points) {
			const converted = convertCoords(myLayer.points[p], ctx.pan, ctx.zoom, 0);
			pointString += converted.x + "," + converted.y + " ";
		}

		return (
			<polygon
				points={pointString}
				onMouseEnter={() => {
					if (tool.onPolygonEnter) {
						tool.onPolygonEnter(num, ctx);
					}
				}}
				onMouseLeave={() => {
					if (tool.onPolygonLeave) {
						tool.onPolygonLeave(num, ctx);
					}
				}}
				onClick={() => {
					if (tool.onPolygonClick) {
						tool.onPolygonClick(num, ctx);
					}
				}}
				style={{ fill: polygon.color }}
			></polygon>);
	};
}