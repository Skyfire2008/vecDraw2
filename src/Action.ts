interface Action {
	name: string;
	do();
	undo();
}