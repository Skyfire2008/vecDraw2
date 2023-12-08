namespace ui {

	interface BgRectProps {
		width: number;
		height: number;
		gridSettings: GridSettings;
		pan: math.PointLike;
		zoom: number;
	}

	export const BgRect: React.FC<BgRectProps> = React.memo(({ width, height, gridSettings, pan, zoom }) => {

		const scaledGrid = math.Point.scale({ x: gridSettings.width, y: gridSettings.height }, zoom);

		const minX = Math.ceil((0 - pan.x) / scaledGrid.x);
		const minY = Math.ceil((0 - pan.y) / scaledGrid.y);

		let startX = pan.x % scaledGrid.x;
		if (startX < 0) {
			startX += scaledGrid.x;
		}
		let startY = pan.y % scaledGrid.y;
		if (startY < 0) {
			startY += scaledGrid.y;
		}

		const lines: Array<React.ReactElement> = [];
		let i = 0;
		let lineX = minX;
		for (i; i <= width / scaledGrid.x; i++) {
			let x = Math.floor(startX + i * scaledGrid.x);

			let strokeWidth = 1;
			if (lineX % gridSettings.mark == 0) {
				strokeWidth = 2;
			} else {
				x += 0.5;
			}
			lines.push(<line key={i} x1={x} y1={0} x2={x} y2={height} stroke={gridSettings.gridColor} strokeWidth={strokeWidth}></line>);

			lineX++;
		}

		//increment i so that keys of vertical and horizontal lines don't overlap
		i++;

		let lineY = minY;
		for (let j = 0; j <= height / scaledGrid.y; j++) {
			let y = Math.floor(startY + j * scaledGrid.y);

			let strokeWidth = 1;
			if (lineY % gridSettings.mark == 0) {
				strokeWidth = 2;
			} else {
				y += 0.5;
			}
			lines.push(<line key={j + i} x1={0} y1={y} x2={width} y2={y} stroke={gridSettings.gridColor} strokeWidth={strokeWidth}></line>);

			lineY++;
		}

		return (<g>
			<rect width={width} height={height} fill={gridSettings.bgColor}></rect>
			{lines}
		</g>)
	});
}