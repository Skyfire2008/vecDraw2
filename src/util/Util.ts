namespace util {

	export const colorToRgb = (color: string): Array<number> => {
		const colorRgb = Number.parseInt(color.substring(1), 16);
		return [colorRgb >> 16, (colorRgb >> 8) & 0xff, colorRgb & 0xff];
	}

	const isOldFormat = (data: types.ShapeData | types.OldShapeData): data is types.OldShapeData => {
		return (data as any).layers == undefined && (data as any).points != undefined && (data as any).lines != undefined;
	}

	export const loadShape = (shapeString: string): Array<types.LayerData> => {
		const json: types.ShapeData | types.OldShapeData = JSON.parse(shapeString);
		if (isOldFormat(json)) {
			const points: Array<math.Point> = json.points.map((p) => { return new math.Point(p.x, p.y) });
			const lines: Array<types.Line> = json.lines.map((l) => {
				return { from: l.from, to: l.to, thickness: 0, color: json.points[l.from].color };
			});
			return [{ points, lines, polygons: [] }];
		} else {
			return json.layers.map((layer) => {
				return { lines: layer.lines, polygons: layer.polygons ? layer.polygons : [], points: layer.points.map((p) => new math.Point(p.x, p.y)) };
			})
		}
	}

	export const drawOntoCanvas = (canvas: HTMLCanvasElement, layers: Array<types.LayerData>, bgColor: string, scale: number) => {

		//scale the fucking layers first!!!
		const scaledLayers: Array<types.LayerData> = [];
		for (const layer of layers) {
			const newLayer: types.LayerData = { points: [], lines: [], polygons: layer.polygons };
			for (const line of layer.lines) {
				newLayer.lines.push(Object.assign({}, line, { thickness: line.thickness * scale }));
			}

			for (const point of layer.points) {
				newLayer.points.push(math.Point.scale(point, scale));
			}
			scaledLayers.push(newLayer);
		}

		let left = Number.POSITIVE_INFINITY;
		let top = Number.POSITIVE_INFINITY;
		let right = Number.NEGATIVE_INFINITY;
		let bottom = Number.NEGATIVE_INFINITY;

		for (const layer of scaledLayers) {
			for (const line of layer.lines) {
				const halfThickness = line.thickness > 0 ? Math.ceil(line.thickness / 2) : 1;

				const from = layer.points[line.from];
				const to = layer.points[line.to];

				//FIXME: doesn't take into account that point coordinates will change
				const minX = Math.min(from.x - halfThickness, to.x - halfThickness);
				const maxX = Math.max(from.x + halfThickness, to.x + halfThickness);
				const minY = Math.min(from.y - halfThickness, to.y - halfThickness);
				const maxY = Math.max(from.y + halfThickness, to.y + halfThickness);

				left = Math.min(left, minX);
				right = Math.max(right, maxX);
				top = Math.min(top, minY);
				bottom = Math.max(bottom, maxY);
			}

			for (const polygon of layer.polygons) {
				for (const pointNum of polygon.points) {
					const point = layer.points[pointNum];
					left = Math.min(left, point.x);
					right = Math.max(right, point.x);
					top = Math.min(top, point.y);
					bottom = Math.max(bottom, point.y);
				}
			}
		}

		canvas.width = right - left;
		canvas.height = bottom - top;

		const ctx = canvas.getContext("2d");
		ctx.lineJoin = "round";
		ctx.lineCap = "round";
		ctx.fillStyle = bgColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		//TODO: move into a separate module so this can be reused by preview
		const convertPoint = (p: math.Point, thickness: number) => {
			const result = math.Point.subtract(p, { x: left, y: top });
			let frac = thickness / 2;
			frac -= Math.floor(frac);

			result.x = Math.floor(result.x) + frac;
			result.y = Math.floor(result.y) + frac;
			return result;
		};

		for (const layer of scaledLayers) {

			for (const polygon of layer.polygons) {
				ctx.beginPath();
				ctx.fillStyle = polygon.color;
				const startPoint = convertPoint(layer.points[polygon.points[0]], 0);
				ctx.moveTo(startPoint.x, startPoint.y)
				for (let i = 1; i < polygon.points.length; i++) {
					const pointNum = polygon.points[i];
					const point = convertPoint(layer.points[pointNum], 0);
					ctx.lineTo(point.x, point.y);
				}
				ctx.fill();
			}

			for (const line of layer.lines) {
				const thickness = line.thickness > 0 ? line.thickness : 1;
				const from = convertPoint(layer.points[line.from], thickness);
				const to = convertPoint(layer.points[line.to], thickness);

				ctx.beginPath();
				ctx.moveTo(from.x, from.y);
				ctx.strokeStyle = line.color;
				ctx.lineWidth = thickness;
				ctx.lineTo(to.x, to.y);
				ctx.stroke();
			}
		}
	}

	export const segmentIntersection = (p0: math.PointLike, p1: math.PointLike, q0: math.PointLike, q1: math.PointLike) => {
		const v = math.Point.subtract(p1, p0);
		const u = math.Point.subtract(q1, q0);

		const bar = u.x * v.y - v.x * u.y;
		const foo = v.x * (q0.y - p0.y) + v.y * (p0.x - q0.x);
		const s = foo / bar;
		if (s > 0 && s < 1) {
			if (v.x != 0) {
				const t = (u.x * s + q0.x - p0.x) / v.x;
				if (t > 0 && t < 1) {
					const result = math.Point.scale(v, t);
					result.add(p0);
					return result;
				}
			} else { //special case for p0.x==p1.x cause calculating t causes division by 0 
				const result = math.Point.scale(u, s);
				result.add(q0);
				if (p0.y < p1.y) {
					if (p0.y < result.y && result.y < p1.y) {
						return result;
					}
				} else {
					if (p1.y < result.y && result.y < p0.y) {
						return result;
					}
				}
			}
		}

		return null;
	}
}