namespace ui {

	interface TooltipProps {
		text: string;
	}

	export const Tooltip: React.FC<TooltipProps> = ({ text }) => {
		return (
			<div className="tooltip">i
				<div className="tooltip-text">{text}</div>
			</div>
		);
	}
}