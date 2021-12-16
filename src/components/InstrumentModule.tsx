import { toInteger } from 'lodash';
import React from 'react';
import { EnvelopeOptions } from 'tone';
import { UpdateModuleParamValue } from '../reducers/params';
import { ModuleField, ModuleId, SourceParamsModule } from '../types/params';
import ModuleWrapper from './ModuleWrapper';
import RangeInput from './RangeInput';

type State = {
  onParamChange: (
    modId: ModuleId,
    field: ModuleField,
    param: string,
    value: UpdateModuleParamValue,
    paramGroup?: string
  ) => void;
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
    onParamChange(id!, 'options', 'envelope', value, 'options');
  };

  const handleDetuneChange = (type: 'amount' | 'rand') => (v: number) => {
    if (type === 'amount') {
      onParamChange(id!, 'options', 'detune', v, 'options');
    } else {
      onParamChange(id!, 'rand', 'detune', v);
    }
  };

  const handleModulationChange = (param: 'rate' | 'amount') => (v: number) => {
    onParamChange(id!, 'tremoloOptions', param, v);
  };

  // min, max & step props of the RangeInput components should be all declared in a constants file

  return (
    <ModuleWrapper id='source' title='Oscillator'>
      <select
        name='waveform'
        id='waveform-select'
        onChange={(e) => onParamChange(id!, 'options', 'type', toInteger(e.target.value), 'oscillator')}
        value={options?.oscillator?.type || 'sine'}
      >
        <option value='sine' id='sine-wave'>
          Sine Wave
        </option>
        <option value='triangle' id='triangle-wave'>
          Triangle Wave
        </option>
        <option value='square' id='square-wave'>
          Square Wave
        </option>
        <option value='sawtooth' id='sawtooth-wave'>
          Sawtooth Wave
        </option>
      </select>

      <h5 className='mt-3'>Envelope</h5>
      <RangeInput
        label='Attack'
        min={0.005}
        max={15}
        step={0.001}
        unit='s'
        initValue={(options?.envelope?.attack as number) || 0.005}
        onChange={handleEnvelopeChange('attack')}
      />
      <RangeInput
        label='Decay'
        min={0.005}
        max={15}
        step={0.001}
        unit='s'
        initValue={(options?.envelope?.decay as number) || 0.005}
        onChange={handleEnvelopeChange('decay')}
      />
      <RangeInput
        label='Sustain'
        min={0}
        max={1}
        step={0.01}
        unit='%'
        initValue={(options?.envelope?.sustain as number) || 0}
        onChange={handleEnvelopeChange('sustain')}
      />
      <RangeInput
        label='Release'
        min={0.005}
        max={15}
        step={0.001}
        unit='s'
        initValue={(options?.envelope?.release as number) || 1}
        onChange={handleEnvelopeChange('release')}
      />

      <h5 className='mt-3'>Detune</h5>
      <RangeInput
        label='Amount'
        min={-50}
        max={50}
        step={1}
        unit='ct'
        initValue={options?.detune || 0}
        onChange={handleDetuneChange('amount')}
      />
      <RangeInput
        label='Randomise'
        min={0}
        max={1}
        step={0.01}
        unit='%'
        initValue={rand?.detune || 0}
        onChange={handleDetuneChange('rand')}
      />

      <h5 className='mt-3'>Modulation</h5>
      <RangeInput
        label='Amount'
        min={0}
        max={1}
        step={0.01}
        unit='%'
        initValue={tremoloOptions.amount}
        onChange={handleModulationChange('amount')}
      />
      <RangeInput
        label='Rate'
        min={1}
        max={60}
        step={0.01}
        unit='Hz'
        initValue={tremoloOptions.rate}
        onChange={handleModulationChange('rate')}
      />
    </ModuleWrapper>
  );
};

export default InstrumentModule;
