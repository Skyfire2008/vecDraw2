enum Split {
	Vertical = 0,
	Horizontal = 1
}

class KdNode {
	point: PointLike; //assume that point is never null
	split: Split;
	kid0: KdNode;
	kid1: KdNode;

	constructor(xSorted: Array<PointLike>, ySorted: Array<PointLike>) {
		const num = xSorted.length;

		if (num == 1) {
			this.point = xSorted[0];
			//TODO: split value?
		} else {
			const xDist = xSorted[num - 1].x - xSorted[0].x;
			const yDist = ySorted[num - 1].y - ySorted[0].y;

			const median = Math.floor(num / 2);
			this.point = xSorted[median];

			let xSorted0: Array<PointLike> = [];
			let xSorted1: Array<PointLike> = [];
			let ySorted0: Array<PointLike> = [];
			let ySorted1: Array<PointLike> = [];

			if (xDist > yDist) {
				this.split = Split.Horizontal;

				xSorted0 = xSorted.splice(0, median);
				xSorted1 = xSorted;
				xSorted1.shift();

				for (const point of ySorted) {
					if (point.y < this.point.y) {
						ySorted0.push(point);
					} else {
						if (point != this.point) {
							ySorted1.push(point);
						}
					}
				}

			} else {
				this.split = Split.Vertical;

				ySorted0 = ySorted.splice(0, median);
				ySorted1 = ySorted;
				ySorted1.shift();

				for (const point of xSorted) {
					if (point.x < this.point.x) {
						xSorted0.push(point);
					} else {
						if (point != this.point) {
							xSorted1.push(point);
						}
					}
				}
			}

			if (xSorted0.length > 0) {
				this.kid0 = new KdNode(xSorted0, ySorted0);
			}
			if (xSorted1.length > 0) {
				this.kid1 = new KdNode(xSorted1, ySorted1);
			}
		}
	}

	public add(point: PointLike) {
		if ((this.split == Split.Horizontal && point.x > this.point.x) || (this.split == Split.Vertical && point.y > this.point.y)) {
			if (this.kid1 != null) {
				this.kid1 = new KdNode([point], null);
			} else {
				this.kid1.add(point);
			}
		} else {
			if (this.kid0 == null) {
				this.kid0 = new KdNode([point], null);
			} else {
				this.kid0.add(point);
			}
		}
	}
}

class KdTree {
	root: KdNode;

	constructor(points: Array<PointLike>) {
		const xSorted = points.slice(0).sort((a, b) => a.x - b.x);
		const ySorted = points.slice(0).sort((a, b) => a.y - b.y);

		this.root = new KdNode(xSorted, ySorted);
	}
}