
interface ToolboxProps {
	tools: Array<Tool>;
	selected: Tool;
	select: (tool: Tool) => void;
}

interface SelectableToolOption extends ToolOption {
	selected: boolean;
}

const Toolbox: React.FC<ToolboxProps> = ({ tools, selected, select }) => {
	const [selectedOption, setSelectedOption] = React.useState(selected.getOptionInd != null ? selected.getOptionInd() : null);
	const prevTool = React.useRef(selected);

	if (prevTool.current != selected) {
		if (selected.getOptionInd != null) {
			setSelectedOption(selected.getOptionInd());
		}
		prevTool.current = selected;
	}

	const selectOption = (num: number) => {
		selected.setOptionInd(num);
		setSelectedOption(num);
	}

	return (<div className="column toolbox">
		<div className="component-header">Tools:</div>
		{tools.map((tool, i) =>
			<div key={i} className={"tool" + (tool.name == selected.name ? " selected" : "")} onClick={() => select(tool)}>
				<div className="tool-item" title={tool.description}>{tool.name}</div>
				{(tool.name == selected.name && tool.options != null) && tool.options.map((opt, j) =>
					<div className={"tool-item tool-option" + (j == selectedOption ? " selected" : "")} title={opt.description} key={j} onClick={() => selectOption(j)}>{opt.name}</div>
				)}
			</div>
		)}
	</div>);
};