import { toInteger } from 'lodash';
import React, { ChangeEvent } from 'react';
import { AutoFilterOptions } from 'tone';
import { AutoFilterParamsModule, EffectName, PartialEffectOptions, ModuleField, ModuleId } from '../types/params';
import ModuleWrapper from './ModuleWrapper';
import RangeInput from './RangeInput';

type State = {
  params: AutoFilterParamsModule; // AutoFilterOptions
  onParamChange: (modId: ModuleId, field: ModuleField, options: PartialEffectOptions) => void;
  onDelete: any;
};

const AutoFilterModule = ({ onParamChange, params, onDelete }: State) => {
  const {
    id,
    name,
    options: { depth, frequency, type },
  } = params;

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const options = { ...params.options, [e.target.name]: e.target.value };
    if (id) {
      onParamChange(id, 'options', options);
    } else {
      console.error(`module id is ${id}`);
    }
  };

  const handleParamChange =
    (param: keyof AutoFilterOptions, paramGroup = '') =>
    (value: number) => {
      onParamChange(id!, 'options', { ...params.options, [param]: value });
    };

  // min, max & step props of the RangeInput components should be all declared in a constants file

  return (
    <ModuleWrapper id={name} title='Auto Filter'>
      <select name='filter-type' id='filter-type-select' onChange={handleSelectChange} value={type}>
        <option value='lowpass' id='lowpass-filter-select-option'>
          Lowpass
        </option>
        <option value='lowshelf' id='lowshelf-filter-select-option'>
          Lowshelf
        </option>
        <option value='highpass' id='highpass-filter-select-option'>
          Highpass
        </option>
        <option value='highshelf' id='highshelf-filter-select-option'>
          Highshelf
        </option>
        <option value='bandpass' id='bandpass-filter-select-option'>
          Bandpass
        </option>
        <option value='allpass' id='allpass-filter-select-option'>
          Allpass
        </option>
        <option value='notch' id='notch-filter-select-option'>
          Notch
        </option>
        <option value='peaking' id='peaking-filter-select-option'>
          Peaking
        </option>
      </select>

      <RangeInput
        label='Frequency'
        min={1}
        max={60}
        step={0.01}
        unit='Hz'
        initValue={toInteger(frequency)}
        onChange={handleParamChange('frequency')}
      />
      <RangeInput
        label='Amount'
        min={0}
        max={1}
        step={0.0001}
        unit='%'
        initValue={toInteger(depth)}
        onChange={handleParamChange('depth')}
      />
    </ModuleWrapper>
  );
};

export default AutoFilterModule;
