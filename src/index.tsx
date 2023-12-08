window.onload = () => {
	const root = (ReactDOM as any).createRoot(document.getElementById("app"));

	root.render(
		<ui.VecDraw ></ui.VecDraw>
	);
}