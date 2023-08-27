interface BgRectProps {
	width: number;
	height: number;
	gridSettings: GridSettings;
	pan: PointLike;
	zoom: number;
}

const BgRect: React.FC<BgRectProps> = React.memo(({ width, height, gridSettings, pan, zoom }) => {

	const startX = pan.x % (gridSettings.width * zoom);
	const startY = pan.y % (gridSettings.height * zoom);

	const lines: Array<React.ReactElement> = [];
	let i = 0;
	for (i; i <= width / (gridSettings.width * zoom); i++) {
		let x = startX + i * gridSettings.width * zoom;
		x = Math.floor(x) + 0.5;
		lines.push(<line key={i} x1={x} y1={0} x2={x} y2={height} stroke={gridSettings.gridColor}></line>);
	}

	for (let j = 0; j <= height / (gridSettings.height * zoom); j++) {
		let y = startY + j * gridSettings.height * zoom;
		y = Math.floor(y) + 0.5;
		lines.push(<line key={j + i} x1={0} y1={y} x2={width} y2={y} stroke={gridSettings.gridColor}></line>);
	}

	return (<>
		<rect width={width} height={height} fill={gridSettings.bgColor}></rect>
		{lines}
	</>)
});