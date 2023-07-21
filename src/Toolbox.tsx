
interface ToolboxProps{
	tools: Array<Tool>;
	selected: Tool;
	select: (tool: Tool) => void;
}

const Toolbox: React.FC<ToolboxProps> = ({ tools, selected, select }) => {
    return (<div className="toolbox">
        { tools.map((tool)=> <div></div>)}
    </div>);
};