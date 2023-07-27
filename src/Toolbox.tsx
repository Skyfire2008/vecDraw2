
interface ToolboxProps {
	tools: Array<Tool>;
	selected: Tool;
	select: (tool: Tool) => void;
}

const Toolbox: React.FC<ToolboxProps> = ({ tools, selected, select }) => {

	return (<div className="toolbox">
		{tools.map((tool, i) =>
			<div key={i} className={"tool" + (tool.name == selected.name ? " selected" : "")} onClick={() => select(tool)}>{tool.name}</div>
		)}
	</div>);
};