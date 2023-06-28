class Point {
	public x: number;
	public y: number;

	public static subtract(a: Point, b: Point): Point {
		return new Point(a.x - b.x, a.y - b.y);
	}

	public static sum(a: Point, b: Point): Point {
		return new Point(a.x + b.x, a.y + b.y);
	}


	constructor(x: number = 0, y: number = 0) {
		this.x = x;
		this.y = y;
	}
}