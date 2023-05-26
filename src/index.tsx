let AppContext: React.Context<AppContextProps>;

window.onload = () => {
	const root = (ReactDOM as any).createRoot(document.getElementById("app"));

	AppContext = React.createContext<AppContextProps>(null);

	root.render(
		<AppContext.Provider value={{
			bgColor: "darkslateblue",
			gridColor: "orange",
			gridWidth: 10,
			gridHeight: 10
		}}>
			<DrawArea width={1280} height={720}></DrawArea>
		</AppContext.Provider>
	);
}