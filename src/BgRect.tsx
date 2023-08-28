interface BgRectProps {
	width: number;
	height: number;
	gridSettings: GridSettings;
	pan: PointLike;
	zoom: number;
}

const BgRect: React.FC<BgRectProps> = React.memo(({ width, height, gridSettings, pan, zoom }) => {

	const minX = Math.ceil((0 - pan.x) / (gridSettings.width * zoom));
	const minY = Math.ceil((0 - pan.y) / (gridSettings.height * zoom));

	const startX = pan.x % (gridSettings.width * zoom);
	const startY = pan.y % (gridSettings.height * zoom);

	const lines: Array<React.ReactElement> = [];
	let i = 0;
	let lineX = minX;
	for (i; i <= width / (gridSettings.width * zoom); i++) {
		let x = Math.floor(startX + i * gridSettings.width * zoom);

		let strokeWidth = 1;
		if (lineX % gridSettings.mark == 0) {
			strokeWidth = 2;
		} else {
			x += 0.5;
		}
		lines.push(<line key={i} x1={x} y1={0} x2={x} y2={height} stroke={gridSettings.gridColor} strokeWidth={strokeWidth}></line>);

		lineX++;
	}

	let lineY = minY;
	for (let j = 0; j <= height / (gridSettings.height * zoom); j++) {
		let y = Math.floor(startY + j * gridSettings.height * zoom);

		let strokeWidth = 1;
		if (lineY % gridSettings.mark == 0) {
			strokeWidth = 2;
		} else {
			y += 0.5;
		}
		lines.push(<line key={j + i} x1={0} y1={y} x2={width} y2={y} stroke={gridSettings.gridColor} strokeWidth={strokeWidth}></line>);

		lineY++;
	}

	return (<>
		<rect width={width} height={height} fill={gridSettings.bgColor}></rect>
		{lines}
	</>)
});