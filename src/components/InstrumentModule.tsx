import React, { ChangeEvent } from 'react';
import { TrackState } from '../types/tracks';
import ModuleWrapper from './ModuleWrapper';
import RangeInput from './RangeInput';

type State = {
  onParamChange: (module, param, value, paramGroup?: string) => void;
  params: TrackState['instrument'];
};

const InstrumentModule = ({ onParamChange, params }: State) => {
  const handleParamChange =
    (param, paramGroup = '') =>
    (value: number) => {
      onParamChange('instrument', param, value, paramGroup);
    };

  const handleWaveformChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onParamChange('instrument', 'waveform', e.target.value);
  };

  const { attack, decay, sustain, release } = params.envelope;

  return (
    <ModuleWrapper id='instrument' title='Oscillator'>
      <select
        name='waveform'
        id='waveform-select'
        onChange={handleWaveformChange}
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
        initValue={attack}
        onChange={handleParamChange('attack', 'envelope')}
      />
      <RangeInput
        label='Decay'
        min={0.005}
        max={15}
        step={0.001}
        unit='s'
        initValue={decay}
        onChange={handleParamChange('decay', 'envelope')}
      />
      <RangeInput
        label='Sustain'
        min={0}
        max={1}
        step={0.01}
        unit='%'
        initValue={sustain}
        onChange={handleParamChange('sustain', 'envelope')}
      />
      <RangeInput
        label='Release'
        min={0.005}
        max={15}
        step={0.001}
        unit='s'
        initValue={release}
        onChange={handleParamChange('release', 'envelope')}
      />

      <h5 className='mt-3'>Modulation</h5>
      <RangeInput
        label='Amount'
        min={0}
        max={1}
        step={0.01}
        unit='%'
        initValue={params.modulationAmount}
        onChange={handleParamChange('modulationAmount')}
      />
      <RangeInput
        label='Amount'
        min={0}
        max={30}
        step={0.01}
        unit='Hz'
        initValue={params.modulationRate}
        onChange={handleParamChange('modulationRate')}
      />
    </ModuleWrapper>
  );
};

export default InstrumentModule;
