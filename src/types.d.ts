declare namespace types {

	export interface ShapeData {
		ver: number;
		layers: Array<{ points: Array<math.PointLike>, lines: Array<Line>, polygons: Array<Polygon> }>;
	}

	export interface OldShapeData {
		points: Array<OldPoint>;
		lines: Array<OldLine>;
	}

	export interface Line {
		from: number;
		to: number;
		thickness: number;
		color: string;
	}

	export interface Polygon {
		points: Array<number>;
		color: string;
	}

	export interface LayerData {
		points: Array<math.Point>;
		lines: Array<Line>;
		polygons: Array<Polygon>;
	}

	interface OldPoint {
		x: number;
		y: number;
		color: string;
	}

	interface OldLine {
		from: number;
		to: number;
	}

	interface Dimensions {
		left: number;
		right: number;
		top: number;
		bottom: number;
	}

}