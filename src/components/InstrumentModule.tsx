import React, { ChangeEvent } from 'react';
import ModuleWrapper from './ModuleWrapper';
import RangeInput from './RangeInput';

type State = {
	onParamChange: (module, param, value) => void;
	params: any;
};

const InstrumentModule = ({ onParamChange, params }: State) => {
	const handleParamChange = (param) => (value: number) => {
		onParamChange('instrument', param, value);
	};

	const handleWaveformChange = (e: ChangeEvent<HTMLSelectElement>) => {
		onParamChange('instrument', 'waveform', e.target.value);
	};

	return (
		<ModuleWrapper id="instrument" title="Oscillator">
			<select name="waveform" id="waveform-select" onChange={handleWaveformChange}>
				<option value="sine" id="sine-wave">
					Sine Wave
				</option>
				<option value="triangle" id="triangle-wave">
					Triangle Wave
				</option>
				<option value="square" id="square-wave">
					Square Wave
				</option>
				<option value="sawtooth" id="sawtooth-wave">
					Sawtooth Wave
				</option>
			</select>

			<h5 className="mt-3">Envelope</h5>
			<RangeInput
				label="Attack Time"
				min={0}
				max={0.5}
				step={0.01}
				unit="ms?"
				initValue={params.attack}
				onChange={handleParamChange('attack')}
			/>
			<RangeInput
				label="Sustain Amount"
				min={0}
				max={1}
				step={0.01}
				unit="%"
				initValue={params.sustain}
				onChange={handleParamChange('sustain')}
			/>
			<RangeInput
				label="Release Time"
				min={0}
				max={0.5}
				step={0.01}
				unit="%"
				initValue={params.release}
				onChange={handleParamChange('release')}
			/>

			<h5 className="mt-3">Modulation</h5>
			<RangeInput
				label="Amount"
				min={0}
				max={1}
				step={0.01}
				unit="%"
				initValue={params.modulationAmount}
				onChange={handleParamChange('modulationAmount')}
			/>
			<RangeInput
				label="Amount"
				min={0}
				max={30}
				step={0.01}
				unit="Hz"
				initValue={params.modulationRate}
				onChange={handleParamChange('modulationRate')}
			/>
		</ModuleWrapper>
	);
};

export default InstrumentModule;
