import React from 'react';
import toInteger from 'lodash/toInteger';
import { EnvelopeOptions } from 'tone';
import { SourceParamsModule, UpdateModuleParamHelper } from '../types/params';
import ModuleWrapper from './ModuleWrapper';
import DraggableRangeInput from './DraggableRangeInput';
import { PARAMS_BOUNDARIES_MAP } from '../lib/constants';
import { toNumber } from 'lodash';

type State = {
  onParamChange: UpdateModuleParamHelper;
  params: SourceParamsModule;
};

const { polySynth } = PARAMS_BOUNDARIES_MAP;

const InstrumentModule = ({ onParamChange, params }: State) => {
  const {
    name,
    id,
    options: { voice, maxPolyphony, options },
    rand,
    tremoloOptions,
  } = params;

  const handleParamChange = (path: string) => (v: number) => {
    onParamChange(id!, path, toNumber(v));
  };

  return (
    <ModuleWrapper id='source' title='Oscillator'>
      <select
        name='waveform'
        id='waveform-select'
        onChange={(e) => onParamChange(id!, 'options.oscillator.type', toInteger(e.target.value))}
        value={options?.oscillator?.type || 'sine'}
      >
        <option value='sine' id='sine-wave'>
          Sine
        </option>
        <option value='triangle' id='triangle-wave'>
          Triangle
        </option>
        <option value='square' id='square-wave'>
          Square
        </option>
        <option value='sawtooth' id='sawtooth-wave'>
          Sawtooth
        </option>
      </select>

      <div className='container-fluid gx-0'>
        <div className='row'>
          <div className='col-auto'>
            <h3 className='mt-3'>Envelope</h3>
            <DraggableRangeInput
              label='Attack'
              min={polySynth.attack.min}
              max={polySynth.attack.max}
              step={polySynth.attack.step}
              unit={polySynth.attack.unit}
              value={(options?.envelope?.attack as number) || 0.005}
              onChange={handleParamChange('options.options.envelope.attack')}
              className='mb-2'
            />
            <DraggableRangeInput
              label='Decay'
              min={polySynth.decay.min}
              max={polySynth.decay.max}
              step={polySynth.decay.step}
              unit={polySynth.decay.unit}
              value={(options?.envelope?.decay as number) || 0.005}
              onChange={handleParamChange('options.options.envelope.decay')}
              className='mb-2'
            />
            <DraggableRangeInput
              label='Sustain'
              min={polySynth.sustain.min}
              max={polySynth.sustain.max}
              step={polySynth.sustain.step}
              unit={polySynth.sustain.unit}
              value={(options?.envelope?.sustain as number) || 0}
              onChange={handleParamChange('options.options.envelope.sustain')}
              className='mb-2'
            />
            <DraggableRangeInput
              label='Release'
              min={polySynth.release.min}
              max={polySynth.release.max}
              step={polySynth.release.step}
              unit={polySynth.release.unit}
              value={(options?.envelope?.release as number) || 1}
              onChange={handleParamChange('options.options.envelope.release')}
              className='mb-2'
            />
          </div>
          <div className='col-auto'>
            <h3 className='mt-3'>Detune</h3>
            <DraggableRangeInput
              label='Amount'
              min={polySynth.detune.min}
              max={polySynth.detune.max}
              step={polySynth.detune.step}
              unit={polySynth.detune.unit}
              value={options?.detune || 0}
              onChange={handleParamChange('options.options.detune')}
              className='mb-2'
            />
            <DraggableRangeInput
              label='Randomise'
              min={polySynth.randDetune.min}
              max={polySynth.randDetune.max}
              step={polySynth.randDetune.step}
              unit={polySynth.randDetune.unit}
              value={rand?.detune || 0}
              onChange={handleParamChange('rand.detune')}
              className='mb-2'
            />

            <h3 className='mt-3'>Modulation</h3>
            <DraggableRangeInput
              label='Amount'
              min={polySynth.modulationRate.min}
              max={polySynth.modulationRate.max}
              step={polySynth.modulationRate.step}
              unit={polySynth.modulationRate.unit}
              value={tremoloOptions.amount}
              onChange={handleParamChange('tremoloOptions.amount')}
              className='mb-2'
            />
            <DraggableRangeInput
              label='Rate'
              min={polySynth.modulationRate.min}
              max={polySynth.modulationRate.max}
              step={polySynth.modulationRate.step}
              unit={polySynth.modulationRate.unit}
              value={tremoloOptions.rate}
              onChange={handleParamChange('tremoloOptions.rate')}
              className='mb-2'
            />
          </div>
        </div>
      </div>
    </ModuleWrapper>
  );
};

export default InstrumentModule;
