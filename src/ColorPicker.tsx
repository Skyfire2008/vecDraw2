interface ColorPickerProps {
	value: string;
	setValue: (value: string) => void;
	onClose: (value: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ value, setValue, onClose }) => {
	const focused = React.useRef(false);
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [selectedColor, setSelectedColor] = React.useState<number>(0);
	const [colors, setColors] = React.useState<Array<string>>([
		"#000000", "#c0c0c0", "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ffffff", "#ffffff", "#ffffff", "#ffffff",
		"#808080", "#ffffff", "#ff8080", "#ffff80", "#80ff80", "#80ffff", "#8080ff", "#ff80ff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"
	]);

	const onKeyDown = React.useRef((e: KeyboardEvent) => {
		if (focused.current && e.key == "Enter") {
			inputRef.current.blur();
		}
	});

	const onBlur = (e: React.FocusEvent) => {
		focused.current = false;
		onClose(value);
	};

	React.useEffect(() => {
		document.addEventListener("keyup", onKeyDown.current);
		return () => { document.removeEventListener("keyup", onKeyDown.current) };
	});

	//build the palette
	let i = 0;
	const palette: Array<React.JSX.Element> = [];
	const onPaletteClick = (i: number) => {
		setSelectedColor(i);
		setValue(colors[i]);
		onClose(colors[i]);
	};
	for (let y = 0; y < 2; y++) {
		const line: Array<React.JSX.Element> = [];
		for (let x = 0; x < 12; x++) {
			line.push(<div key={x} onClick={onPaletteClick.bind(null, i)} className={`palette ${i == selectedColor ? "selected" : ""}`} style={{ backgroundColor: colors[i] }}></div>)
			i++;
		}
		palette.push(<div className="line" key={y}>{line}</div>);
	}

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newColor = e.target.value;
		if (selectedColor >= 0 && selectedColor < 24) {
			colors[selectedColor] = newColor;
			setColors(colors.slice(0));
		}
		setValue(newColor);
	};

	return (<div className="line panel">
		<input
			type="color"
			ref={inputRef}
			value={value}
			onChange={onChange}
			onFocus={(e) => focused.current = false}
			onBlur={onBlur}
			onKeyUp={() => { console.log("doesnt work"); }}></input>
		<div className="column">{palette}</div>
	</div>);
};