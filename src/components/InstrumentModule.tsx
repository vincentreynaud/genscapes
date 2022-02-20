import React from 'react';
import toInteger from 'lodash/toInteger';
import { EnvelopeOptions } from 'tone';
import { SourceParamsModule, UpdateModuleParamHelper } from '../types/params';
import ModuleWrapper from './ModuleWrapper';
import DraggableRangeInput from './DraggableRangeInput';

type State = {
  onParamChange: UpdateModuleParamHelper;
  params: SourceParamsModule;
};

const InstrumentModule = ({ onParamChange, params }: State) => {
  const {
    name,
    id,
    options: { voice, maxPolyphony, options },
    rand,
    tremoloOptions,
  } = params;

  const handleEnvelopeChange = (param: keyof EnvelopeOptions) => (v: number) => {
    const value = { ...options?.envelope, [param]: v };
    onParamChange(id!, 'options.options.envelope', value);
  };

  const handleDetuneChange = (type: 'amount' | 'rand') => (v: number) => {
    if (type === 'amount') {
      onParamChange(id!, 'options.options.detune', v);
    } else {
      onParamChange(id!, 'rand.detune', v);
    }
  };

  const handleModulationChange = (param: 'rate' | 'amount') => (v: number) => {
    onParamChange(id!, `tremoloOptions.${param}`, v);
  };

  // min, max & step props of the RangeInput components should be all declared in a constants file

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
              min={0.005}
              max={15}
              step={0.001}
              unit='s'
              value={(options?.envelope?.attack as number) || 0.005}
              onChange={handleEnvelopeChange('attack')}
              className='mb-2'
            />

            <DraggableRangeInput
              label='Decay'
              min={0.005}
              max={15}
              step={0.001}
              unit='s'
              value={(options?.envelope?.decay as number) || 0.005}
              onChange={handleEnvelopeChange('decay')}
              className='mb-2'
            />
            <DraggableRangeInput
              label='Sustain'
              min={0}
              max={1}
              step={0.01}
              unit='%'
              value={(options?.envelope?.sustain as number) || 0}
              onChange={handleEnvelopeChange('sustain')}
              className='mb-2'
            />
            <DraggableRangeInput
              label='Release'
              min={0.005}
              max={15}
              step={0.001}
              unit='s'
              value={(options?.envelope?.release as number) || 1}
              onChange={handleEnvelopeChange('release')}
              className='mb-2'
            />
          </div>
          <div className='col-auto'>
            <h3 className='mt-3'>Detune</h3>
            <DraggableRangeInput
              label='Amount'
              min={-50}
              max={50}
              step={1}
              unit='ct'
              value={options?.detune || 0}
              onChange={handleDetuneChange('amount')}
              className='mb-2'
            />
            <DraggableRangeInput
              label='Randomise'
              min={0}
              max={1}
              step={0.01}
              unit='%'
              value={rand?.detune || 0}
              onChange={handleDetuneChange('rand')}
              className='mb-2'
            />

            <h3 className='mt-3'>Modulation</h3>
            <DraggableRangeInput
              label='Amount'
              min={0}
              max={1}
              step={0.01}
              unit='%'
              value={tremoloOptions.amount}
              onChange={handleModulationChange('amount')}
              className='mb-2'
            />
            <DraggableRangeInput
              label='Rate'
              min={1}
              max={60}
              step={0.01}
              unit='Hz'
              value={tremoloOptions.rate}
              onChange={handleModulationChange('rate')}
              className='mb-2'
            />
          </div>
        </div>
      </div>
    </ModuleWrapper>
  );
};

export default InstrumentModule;
