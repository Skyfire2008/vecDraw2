enum Split {
	Vertical = 0,
	Horizontal = 1,
}

interface KdLine {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
}

class KdNode {
	point: PointLike; //assume that point is never null
	split: Split;
	kid0: KdNode;
	kid1: KdNode;

	constructor(xSorted: Array<PointLike>, ySorted: Array<PointLike>, defaultSplit: Split) {
		const num = xSorted.length;

		if (num == 1) { // if array has only one element, this is a leaf node
			this.point = xSorted[0];
			this.split = defaultSplit;
		} else {
			const xDist = xSorted[num - 1].x - xSorted[0].x;
			const yDist = ySorted[num - 1].y - ySorted[0].y;

			let median = Math.floor(num / 2);

			let xSorted0: Array<PointLike> = [];
			let xSorted1: Array<PointLike> = [];
			let ySorted0: Array<PointLike> = [];
			let ySorted1: Array<PointLike> = [];

			if (xDist > yDist) {
				this.split = Split.Horizontal;
				this.point = xSorted[median];
				while (median > 0) {
					const prev = xSorted[median - 1];
					if (prev.x == this.point.x && prev.y == this.point.y) {
						median = median - 1;
						this.point = xSorted[median];
					} else {
						break;
					}
				}

				xSorted0 = xSorted.splice(0, median);
				xSorted1 = xSorted;
				xSorted1.shift();

				for (const point of ySorted) {
					if (point.x < this.point.x) {
						ySorted0.push(point);
					} else if (point.x > this.point.x) {
						ySorted1.push(point);
					} else if (point != this.point) {
						if (point.y < this.point.y) {
							ySorted0.push(point);
						} else {
							ySorted1.push(point);
						}
					}
				}
			} else {
				this.split = Split.Vertical;
				this.point = ySorted[median];
				while (median > 0) {
					const prev = ySorted[median - 1];
					if (prev.x == this.point.x && prev.y == this.point.y) {
						median = median - 1;
						this.point = ySorted[median];
					} else {
						break;
					}
				}

				ySorted0 = ySorted.splice(0, median);
				ySorted1 = ySorted;
				ySorted1.shift();

				for (const point of xSorted) {
					if (point.y < this.point.y) {
						xSorted0.push(point);
					} else if (point.y > this.point.y) {
						xSorted1.push(point);
					} else if (point != this.point) {
						if (point.x < this.point.x) {
							xSorted0.push(point);
						} else {
							xSorted1.push(point);
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
				this.kid0 = new KdNode(xSorted0, ySorted0, 1 - this.split);
			}
			if (xSorted1.length > 0) {
				this.kid1 = new KdNode(xSorted1, ySorted1, 1 - this.split);
			}
		}
	}

	public add(point: PointLike) {
		if (
			(this.split == Split.Horizontal && point.x > this.point.x) ||
			(this.split == Split.Vertical && point.y > this.point.y)
		) {
			if (this.kid1 == null) {
				this.kid1 = new KdNode([point], null, 1 - this.split);
			} else {
				this.kid1.add(point);
			}
		} else {
			if (this.kid0 == null) {
				this.kid0 = new KdNode([point], null, 1 - this.split);
			} else {
				this.kid0.add(point);
			}
		}
	}

	public getLines(pan: PointLike, zoom: number, minX: number, minY: number, maxX: number, maxY: number): Array<KdLine> {
		let result: Array<KdLine> = [];

		if (this.split == Split.Horizontal) {
			const p = convertCoords(this.point, pan, zoom, 1);
			result.push({ x1: p.x, x2: p.x, y1: minY, y2: maxY });

			if (this.kid0 != null) {
				result = result.concat(this.kid0.getLines(pan, zoom, minX, minY, p.x, maxY));
			}
			if (this.kid1 != null) {
				result = result.concat(this.kid1.getLines(pan, zoom, p.x, minY, maxX, maxY));
			}
		} else if (this.split == Split.Vertical) {
			const p = convertCoords(this.point, pan, zoom, 1);
			result.push({ x1: minX, x2: maxX, y1: p.y, y2: p.y });

			if (this.kid0 != null) {
				result = result.concat(this.kid0.getLines(pan, zoom, minX, minY, maxX, p.y));
			}
			if (this.kid1 != null) {
				result = result.concat(this.kid1.getLines(pan, zoom, minX, p.y, maxX, maxY));
			}
		}

		return result;
	}
}

class KdTree {
	root: KdNode;

	constructor(points: Array<PointLike>) {
		const xSorted = points.slice(0).sort((a, b) => {
			const diff = a.x - b.x;
			return diff != 0 ? diff : a.y - b.y;
		});
		const ySorted = points.slice(0).sort((a, b) => {
			const diff = a.y - b.y;
			return diff != 0 ? diff : a.x - b.x;
		});

		if (points.length > 0) {
			this.root = new KdNode(xSorted, ySorted, Split.Horizontal);
		}
	}

	public addPoint(point: PointLike) {
		if (this.root != null) {
			this.root.add(point);
		} else {
			this.root = new KdNode([point], [point], Split.Horizontal);
		}
	}

	public getLines(pan: PointLike, zoom: number, width: number, height: number): Array<KdLine> {
		return this.root.getLines(pan, zoom, 0, 0, width, height);
	}
}
