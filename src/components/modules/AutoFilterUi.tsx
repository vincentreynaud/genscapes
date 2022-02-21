import React, { ChangeEvent, useMemo } from 'react';
import { toInteger } from 'lodash';
import { getParamsBoundaries, MODULES_DISPLAY_NAMES_MAP } from '../../lib/constants';
import { AutoFilterParamsModule, UpdateModuleParamHelper } from '../../types/params';
import ModuleWrapper from '../shared/ModuleWrapper';
import RangeInput from '../shared/RangeInput';
import SliderInput from '../shared/SliderInput';

type Props = {
  params: AutoFilterParamsModule; // AutoFilterOptions
  onParamChange: UpdateModuleParamHelper;
  onDelete: any;
};

export default function AutoFilterUi({ onParamChange, params, onDelete }: Props) {
  const { autoFilter } = useMemo(() => getParamsBoundaries(), []);
  const {
    id,
    name,
    options: { depth, frequency, type },
  } = params;

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (id) {
      onParamChange(id, `options.${e.target.name}`, e.target.value);
    } else {
      console.error(`module id is ${id}`);
    }
  };
  const handleParamChange = (path: string) => (v: number) => {
    if (id) {
      onParamChange(id, path, v);
    } else {
      console.error(`module id is ${id}`);
    }
  };

  return (
    <ModuleWrapper id={name} title={MODULES_DISPLAY_NAMES_MAP[name]}>
      <select name='filter-type' id='filter-type-select' className='mb-2' onChange={handleSelectChange} value={type}>
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
      <SliderInput
        label='Freq.'
        min={autoFilter.frequency.min}
        max={autoFilter.frequency.max}
        step={autoFilter.frequency.step}
        unit={autoFilter.frequency.unit}
        value={toInteger(frequency)}
        onChange={handleParamChange('options.frequency')}
        className='mb-2'
      />
      <SliderInput
        label='Amount'
        min={autoFilter.depth.min}
        max={autoFilter.depth.max}
        step={autoFilter.depth.step}
        unit={autoFilter.depth.unit}
        value={toInteger(depth)}
        onChange={handleParamChange('options.depth')}
        className='mb-2'
      />
    </ModuleWrapper>
  );
}
