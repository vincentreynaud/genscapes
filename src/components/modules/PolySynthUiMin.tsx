import React, { useMemo } from 'react';
import { MODULES_DISPLAY_NAMES_MAP, getTrackParamsBoundaries } from '../../lib/constants';
import { PolySynthParamsModule, UpdateModuleParamHelper } from '../../types/params';
import SliderInput from '../shared/SliderInput';

type Props = {
  onParamChange: UpdateModuleParamHelper;
  mod: PolySynthParamsModule;
};

export default function PolySynthUiMin({ onParamChange, mod }: Props) {
  const { polySynth } = useMemo(() => getTrackParamsBoundaries(), []);
  const { attack, decay, sustain, release } = mod?.options?.options?.envelope as any;

  const handleParamChange = (path: string) => (v: number) => {
    if (mod.id) {
      onParamChange(mod.id, path, v);
    } else {
      console.error(`module id is ${mod.id}`);
    }
  };

  return (
    <div className='col'>
      <h4>{MODULES_DISPLAY_NAMES_MAP[mod.name]}</h4>
      <div className='container-fluid p-0'>
        <div className='row'>
          <div className='col-auto'>
            <SliderInput
              label='A'
              min={polySynth.attack.min}
              max={polySynth.attack.max}
              step={polySynth.attack.step}
              unit={polySynth.attack.unit}
              value={attack}
              onChange={handleParamChange('options.options.envelope.attack')}
              className='mb-2'
            />
            <SliderInput
              label='S'
              min={polySynth.sustain.min}
              max={polySynth.sustain.max}
              step={polySynth.sustain.step}
              unit={polySynth.sustain.unit}
              value={sustain}
              onChange={handleParamChange('options.options.envelope.sustain')}
              className='mb-2'
            />
          </div>
          <div className='col-auto'>
            <SliderInput
              label='D'
              min={polySynth.decay.min}
              max={polySynth.decay.max}
              step={polySynth.decay.step}
              unit={polySynth.decay.unit}
              value={decay}
              onChange={handleParamChange('options.options.envelope.decay')}
              className='mb-2'
            />
            <SliderInput
              label='R'
              min={polySynth.release.min}
              max={polySynth.release.max}
              step={polySynth.release.step}
              unit={polySynth.release.unit}
              value={release}
              onChange={handleParamChange('options.options.envelope.release')}
              className='mb-2'
            />
          </div>
        </div>
      </div>
    </div>
  );
}
