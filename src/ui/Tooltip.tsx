namespace ui {

	interface TooltipProps {
		text: string;
		extraClasses?: string;
	}

	export const Tooltip: React.FC<TooltipProps> = ({ text, extraClasses }) => {

		const className = extraClasses ? "tooltip-text " + extraClasses : "tooltip-text";

		return (
			<div className="tooltip">i
				<div className={className}>{text}</div>
			</div>
		);
	}
}