class Point {
	public x: number;
	public y: number;

	public static subtract(a: Point, b: Point): Point {
		return new Point(a.x - b.x, a.y - b.y);
	}

	public static sum(a: Point, b: Point): Point {
		return new Point(a.x + b.x, a.y + b.y);
	}

	public static scale(p: Point, m: number): Point {
		return new Point(p.x * m, p.y * m);
	}

	constructor(x: number = 0, y: number = 0) {
		this.x = x;
		this.y = y;
	}

	public add(other: Point) {
		this.x += other.x;
		this.y += other.y;
	}
}