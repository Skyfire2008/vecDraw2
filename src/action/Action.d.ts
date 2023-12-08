declare namespace action {
	type ActionKeyWord = string | { pointNum: number } | { lineNum: number };

	export interface Action {
		description: Array<ActionKeyWord>;
		layerNum: number;
		do(ctx: ui.AppContextProps): void;
		undo(ctx: ui.AppContextProps): void;
	}
}