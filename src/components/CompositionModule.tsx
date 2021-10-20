import React from 'react';
import ModuleWrapper from './ModuleWrapper';
import RangeInput from './RangeInput';

type State = {
	onParamChange: (module, param, value) => void;
	params: any;
};

const CompositionModule = ({ params, onParamChange }: State) => {
	const handleParamChange = (param) => (value: number) => {
		onParamChange('composition', param, value);
	};

	return (
		<ModuleWrapper id="composition-module" title="Composition">
			<div className="container-fluid px-0">
				<div className="row no-gutters">
					<div className="col-6">
						<RangeInput
							label="Note length"
							min={0.2}
							max={48}
							step={0.1}
							unit="s"
							initValue={params.noteLength}
							onChange={handleParamChange('noteLength')}
						/>
					</div>
					<div className="col-6">
						<RangeInput
							label="Randomise"
							min={0}
							max={1}
							step={0.01}
							unit="%"
							initValue={params.randomiseNoteLength}
							onChange={handleParamChange('randomiseNoteLength')}
						/>
					</div>
				</div>
			</div>
			<div className="container-fluid px-0">
				<div className="row no-gutters">
					<div className="col-6">
						<RangeInput
							label="Interval"
							min={0}
							max={48}
							step={0.1}
							unit="s"
							initValue={params.interval}
							onChange={handleParamChange('interval')}
						/>
					</div>
					<div className="col-6">
						<RangeInput
							label="Randomise"
							min={0}
							max={1}
							step={0.01}
							unit="%"
							initValue={params.randomiseInterval}
							onChange={handleParamChange('randomiseInterval')}
						/>
					</div>
				</div>
			</div>
		</ModuleWrapper>
	);
};

export default CompositionModule;
