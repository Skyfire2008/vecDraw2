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

	public static dot(a: PointLike, b: PointLike): number {
		return a.x * b.x + a.y * b.y;
	}

	public static distance(a: PointLike, b: PointLike) {
		const x = a.x - b.x;
		const y = a.y - b.y;
		return Math.sqrt(x * x + y * y);
	}

	/**
	 * Project src onto tgt
	 * @param src 
	 * @param tgt 
	 */
	public static project(src: PointLike, tgt: PointLike): Point {
		//result = tgt * cosA * |src| / |tgt|
		//cosA = src*tgt / (|src|*|tgt|)
		//result = (src*tgt)*tgt / |tgt|2

		const dot = Point.dot(src, tgt);
		let result = new Point(tgt.x, tgt.y);
		result.multScalar(dot);
		result.multScalar(1 / Point.dot(tgt, tgt));
		return result;
	}

	constructor(x: number = 0, y: number = 0) {
		this.x = x;
		this.y = y;
	}

	public clone(): Point {
		return new Point(this.x, this.y);
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

	public div(other: PointLike) {
		this.x /= other.x;
		this.y /= other.y;
	}

	public multScalar(m: number) {
		this.x *= m;
		this.y *= m;
	}
}