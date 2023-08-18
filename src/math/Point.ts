interface PointLike {
	x: number;
	y: number;
}

class Point implements PointLike {
	public x: number;
	public y: number;

	public static subtract(a: PointLike, b: PointLike): Point {
		return new Point(a.x - b.x, a.y - b.y);
	}

	public static sum(a: PointLike, b: PointLike): Point {
		return new Point(a.x + b.x, a.y + b.y);
	}

	public static scale(p: PointLike, m: number): Point {
		return new Point(p.x * m, p.y * m);
	}

	public static equals(a: PointLike, b: PointLike): boolean {
		return a.x == b.x && a.y == b.y;
	}

	constructor(x: number = 0, y: number = 0) {
		this.x = x;
		this.y = y;
	}

	public add(other: PointLike) {
		this.x += other.x;
		this.y += other.y;
	}

	public sub(other: PointLike) {
		this.x -= other.x;
		this.y -= other.y;
	}

	public mult(other: PointLike) {
		this.x *= other.x;
		this.y *= other.y;
	}

	public multScalar(m: number) {
		this.x *= m;
		this.y *= m;
	}
}