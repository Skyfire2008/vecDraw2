type ActionKeyWord = string | { pointNum: number } | { lineNum: number };

interface Action {
	description: Array<ActionKeyWord>;
	layerNum: number;
	do(ctx: AppContextProps): void;
	undo(ctx: AppContextProps): void;
}