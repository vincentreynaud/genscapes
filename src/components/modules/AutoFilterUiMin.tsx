import React, { useMemo } from 'react';
import SliderInput from '../shared/SliderInput';
import { MODULES_DISPLAY_NAMES_MAP, getTrackParamsBoundaries } from '../../lib/constants';
import { AutoFilterParamsModule, UpdateModuleParamHelper } from '../../types/params';
import toInteger from 'lodash/toInteger';

type Props = {
  onParamChange: UpdateModuleParamHelper;
  mod: AutoFilterParamsModule;
};

export default function AutoFilterUiMin({ onParamChange, mod }: Props) {
  const { frequency, depth } = mod?.options;
  const { autoFilter: boundaries } = useMemo(() => getTrackParamsBoundaries(), []);

  const handleParamChange = (path: string) => (v: number) => {
    if (mod.id) {
      onParamChange(mod.id, path, v);
    } else {
      console.error(`module id is ${mod.id}`);
    }
  };

  return (
    <div className='col-auto'>
      <h5>{MODULES_DISPLAY_NAMES_MAP[mod.name]}</h5>
      <div className='container-fluid p-0'>
        <div className='row'>
          <div className='col-auto'>
            <SliderInput
              label='Freq.'
              min={boundaries.frequency.min}
              max={boundaries.frequency.max}
              step={boundaries.frequency.step}
              unit={boundaries.frequency.unit}
              value={toInteger(frequency)}
              onChange={handleParamChange('options.frequency')}
              className='mb-2'
            />
            <SliderInput
              label='Amount'
              min={boundaries.depth.min}
              max={boundaries.depth.max}
              step={boundaries.depth.step}
              unit={boundaries.depth.unit}
              value={toInteger(depth)}
              onChange={handleParamChange('options.depth')}
              className='mb-2'
            />
          </div>
        </div>
      </div>
    </div>
  );
}
