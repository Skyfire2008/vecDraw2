interface ColorPickerProps {
	value: string;
	setValue: (value: string) => void;
	onClose: (value: string) => void;
}

enum ColorType {
	PreDefined = 0,
	Custom = 1
}

const ColorPicker: React.FC<ColorPickerProps> = ({ value, setValue, onClose }) => {
	const focused = React.useRef(false);
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [selectedColor, setSelectedColor] = React.useState<{ num: number, type: ColorType }>({ num: 0, type: ColorType.PreDefined });

	const preDefinedColors = [
		"#000000", "#808080", "#c0c0c0", "#ffffff", "#ff0000", "#ff8080", "#ffff00", "#ffff80",
		"#00ff00", "#80ff80", "#00ffff", "#80ffff", "#0000ff", "#8080ff", "#ff00ff", "#ff80ff"
	];
	const [customColors, setCustomColors] = React.useState<Array<string>>([
		"#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff",
		"#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"
	]);

	//array of last used custom color indices, with last used one the first
	const lastUsedCustom = React.useRef<Array<number>>(null);
	if (lastUsedCustom.current == null) {
		lastUsedCustom.current = [];
		for (let i = 0; i < customColors.length; i++) {
			lastUsedCustom.current[i] = i;
		}
	}

	/**
	 * Refreshes a custom color, by pushing its index to the front
	 * @param i 
	 */
	const refreshCustomColor = (i: number) => {
		const pos = lastUsedCustom.current.findIndex((num) => num == i);
		lastUsedCustom.current.splice(pos, 1);
		lastUsedCustom.current.push(i);
	};

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

	const onPaletteClick = (num: number, type: ColorType) => {
		setSelectedColor({ num, type });

		let color: string;
		switch (type) {
			case ColorType.PreDefined:
				color = preDefinedColors[num];
				break;
			case ColorType.Custom:
				color = customColors[num];
				refreshCustomColor(num);
				break;
		}

		setValue(color);
		onClose(color);
	};

	//build the palette
	let i = 0;
	const palette: Array<React.JSX.Element> = [];
	for (let x = 0; x < 8; x++) {
		const column: Array<React.JSX.Element> = [];
		for (let y = 0; y < 2; y++) {
			column.push(<div
				key={y}
				onClick={onPaletteClick.bind(null, i, ColorType.PreDefined)}
				className={`palette ${selectedColor.type == ColorType.PreDefined && selectedColor.num == i ? "selected" : ""}`}
				style={{ backgroundColor: preDefinedColors[i] }}></div>)
			i++;
		}
		palette.push(<div className="column" key={x}>{column}</div>);
	}

	i = 0;
	for (let x = 0; x < 8; x++) {
		const column: Array<React.JSX.Element> = [];
		for (let y = 0; y < 2; y++) {
			column.push(<div
				key={y}
				onClick={onPaletteClick.bind(null, i, ColorType.Custom)}
				className={`palette ${selectedColor.type == ColorType.Custom && selectedColor.num == i ? "selected" : ""}`}
				style={{ backgroundColor: customColors[i] }}></div>)
			i++;
		}
		palette.push(<div className="column" key={x + 8}>{column}</div>);
	}

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newColor = e.target.value;

		if (selectedColor.type == ColorType.Custom) {
			customColors[selectedColor.num] = newColor;
			refreshCustomColor(selectedColor.num);
			setCustomColors(customColors.slice(0));
		} else {

			//find new color in map first
			let colorPos = { num: preDefinedColors.findIndex((item) => item == newColor), type: null };
			if (colorPos.num >= 0) {
				colorPos.type = ColorType.PreDefined;
			} else {
				colorPos.num = customColors.findIndex((item) => item == newColor)
				if (colorPos.num >= 0) {
					colorPos.type = ColorType.Custom;
					refreshCustomColor(colorPos.num);
				}
			}

			//if color still not found, add it to custom colors
			if (colorPos.num < 0) {
				colorPos.num = lastUsedCustom.current[0];
				colorPos.type = ColorType.Custom;
				customColors[colorPos.num] = newColor;
				setCustomColors(customColors.slice(0));
				refreshCustomColor(colorPos.num);
			}

			setSelectedColor(colorPos);
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
		<div className="line">{palette}</div>
	</div>);
};