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

			let xSorted0: Array<PointLike> = [];
			let xSorted1: Array<PointLike> = [];
			let ySorted0: Array<PointLike> = [];
			let ySorted1: Array<PointLike> = [];

			if (xDist > yDist) {
				this.split = Split.Horizontal;
				this.point = xSorted[median];

				xSorted0 = xSorted.splice(0, median);
				xSorted1 = xSorted;
				xSorted1.shift();

				for (const point of ySorted) {
					if (point.x < this.point.x) {
						ySorted0.push(point);
					} else {
						if (point != this.point) {
							if (point.x > this.point.x || (point.x == this.point.x && point.y < this.point.y)) {
								ySorted1.push(point);
							}
						}
					}
				}

			} else {
				this.split = Split.Vertical;
				this.point = ySorted[median];

				ySorted0 = ySorted.splice(0, median);
				ySorted1 = ySorted;
				ySorted1.shift();

				for (const point of xSorted) {
					if (point.y < this.point.y) {
						xSorted0.push(point);
					} else {
						if (point != this.point) {
							if (point.y > this.point.y || (point.y == this.point.y && point.x < this.point.x)) {
								xSorted1.push(point);
							}
						}
					}
				}
			}

			//TODO: used to catch errors, remove later
			for (const point of xSorted0) {
				if (ySorted0.indexOf(point) < 0) {
					throw "W0T W0T W0T";
				}
			}
			for (const point of xSorted1) {
				if (ySorted1.indexOf(point) < 0) {
					throw "W0T W0T W0T";
				}
			}
			for (const point of ySorted0) {
				if (xSorted0.indexOf(point) < 0) {
					throw "W0T W0T W0T";
				}
			}
			for (const point of ySorted1) {
				if (xSorted1.indexOf(point) < 0) {
					throw "W0T W0T W0T";
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
		const xSorted = points.slice(0).sort((a, b) => {
			const diff = a.x - b.x;
			return (diff != 0) ? diff : a.y - b.y;
		});
		const ySorted = points.slice(0).sort((a, b) => {
			const diff = a.y - b.y;
			return (diff != 0) ? diff : a.x - b.x;
		});

		this.root = new KdNode(xSorted, ySorted);
	}
}