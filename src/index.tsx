window.onload = () => {
	const root = (ReactDOM as any).createRoot(document.getElementById("app"));

	root.render(
		<VecDraw ></VecDraw>
	);
}