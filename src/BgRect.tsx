interface BgRectProps {
	width: number;
	height: number;
}

const BgRect: React.FC<BgRectProps> = ({ width, height }) => {
	const ctx = React.useContext(AppContext);

	const startX = ctx.pan.x % (ctx.gridSettings.width * ctx.zoom);
	const startY = ctx.pan.y % (ctx.gridSettings.height * ctx.zoom);

	const lines: Array<React.ReactElement> = [];
	let i = 0;
	for (i; i <= width / (ctx.gridSettings.width * ctx.zoom); i++) {
		let x = startX + i * ctx.gridSettings.width * ctx.zoom;
		x = Math.floor(x) + 0.5;
		lines.push(<line key={i} x1={x} y1={0} x2={x} y2={height} stroke={ctx.gridSettings.gridColor}></line>);
	}

	for (let j = 0; j <= height / (ctx.gridSettings.height * ctx.zoom); j++) {
		let y = startY + j * ctx.gridSettings.height * ctx.zoom;
		y = Math.floor(y) + 0.5;
		lines.push(<line key={j + i} x1={0} y1={y} x2={width} y2={y} stroke={ctx.gridSettings.gridColor}></line>);
	}

	return (<>
		<rect width={width} height={height} fill={ctx.gridSettings.bgColor}></rect>
		{lines}
	</>)
};