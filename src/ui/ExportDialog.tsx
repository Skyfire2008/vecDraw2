namespace ui {

	interface ExportDialogProps {
		open: boolean;
		onClose: () => void;
	}

	export const ExportDialog: React.FC<ExportDialogProps> = ({ open, onClose }) => {

		const dialogRef = React.useRef<HTMLDialogElement>();

		//PNG PROPERTIES
		const [scale, setScale] = React.useState(1);

		//SDF PROPERTIES
		const [spread, setSpread] = React.useState(32);
		const [sampleMult, setSampleMult] = React.useState(1);
		const [targetColors, setTargetColors] = React.useState(["#ff0000", "#00ff00", "#0000ff", "#ffffff"]);
		const [strict, setStrict] = React.useState(false);

		if (open) {
			dialogRef.current.showModal();
		}

		const onCancel = () => {
			dialogRef.current.close();
			onClose();
		}

		const setColor = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
			targetColors[index] = e.target.value;
			setTargetColors(targetColors.slice(0));
		}

		return (
			<dialog className="export-dialog" ref={dialogRef}>
				<div className="line">
					<div className="export-block">
						<div className="export-title">Export as PNG</div>
						<div className="input-wrapper">
							<label>Scale:</label>
							<div className="line">
								<input type="number" min="1" step="0.5"></input>
								<Tooltip text="Scale of resulting image."></Tooltip>
							</div>
						</div>
						<div>
							<button>Export and save as PNG</button>
						</div>
					</div>
					<div className="export-block">
						<div className="export-title">Export as SDF</div>
						<div className="input-wrapper">
							<label>Spread:</label>
							<div className="line">
								<input type="number" min="1" max="255" step="1" value={spread} onChange={(e) => setSpread(Number.parseInt(e.target.value))}></input>
								<Tooltip text="Pixel distance from shape borders within which the SDF will be calculated."></Tooltip>
							</div>
						</div>
						<div className="input-wrapper">
							<label>Sample multiplier:</label>
							<div className="line">
								<input type="number" min="1" step="1" value={sampleMult} onChange={(e) => setSampleMult(Number.parseInt(e.target.value))}></input>
								<Tooltip text="Amount of samples taken per pixel per axis to calculate the distance from shape border."></Tooltip>
							</div>
						</div>
						<div>
							<div className="input-wrapper">
								<div className="input-label">Color - channel binding::</div>
								<Tooltip text="
									SDF is exported as a 4 color channel PNG image, so it's possible to calculate and store 4 different SDFs, so as to render the SDF with more than one color at runtime.
									Use the provided color pickers to select which color gets assigned to which channel.
								"></Tooltip>
							</div>
							<div>
								<label className="input-label">R:</label>
								<input type="color" value={targetColors[0]} onChange={setColor.bind(null, 0)}></input>
							</div>
							<div>
								<label className="input-label">G:</label>
								<input type="color" value={targetColors[1]} onChange={setColor.bind(null, 1)}></input>
							</div>
							<div>
								<label className="input-label">B:</label>
								<input type="color" value={targetColors[2]} onChange={setColor.bind(null, 2)}></input>
							</div>
							<div>
								<label className="input-label">A:</label>
								<input type="color" value={targetColors[3]} onChange={setColor.bind(null, 3)}></input>
							</div>
						</div>
						<div className="input-wrapper">
							<label>Ignore other colors:</label>
							<div className="line">
								<input type="checkbox" checked={strict} onChange={(e) => setStrict(e.target.checked)}></input>
								<Tooltip text="If a line or polygon's color is not bound to a channel, it will be ignored. Otherwise it will be assigned to the channel with closest color."></Tooltip>
							</div>
						</div>
						<div>
							<button>Export and save SDF</button>
						</div>
						<div>
							<button>Save descriptor</button>
						</div>
					</div>
				</div>
				<button onClick={onCancel}>Cancel</button>
			</dialog >
		);
	};
}