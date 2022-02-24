import React, { useMemo } from 'react';
import SliderInput from '../shared/SliderInput';
import { MODULES_DISPLAY_NAMES_MAP, getTrackParamsBoundaries, getOctaves } from '../../lib/constants';
import { AutoFilterParamsModule, TrackState, UpdateTrackParamHelper } from '../../types/params';
import toInteger from 'lodash/toInteger';
import Select from '../shared/Select';

type Props = {
  onParamChange: UpdateTrackParamHelper;
  params: TrackState['composition'];
  setCurrentScale: any;
};

export default function CompositionUiMin({ params, onParamChange, setCurrentScale }: Props) {
  console.log(params);
  const { notes } = params;
  const { composition: boundaries } = useMemo(() => getTrackParamsBoundaries(), []);

  const handleParamChange = (param) => (value: number) => {
    onParamChange(param, value);
  };
  return (
    <div className='col-auto'>
      <h5 className='d-inline-block mb-2'>{MODULES_DISPLAY_NAMES_MAP['composition']}</h5>
      <span className='ms-2' id='notes-display'>
        {notes.scaleName && notes.scaleName}
      </span>
      <div className='container-fluid p-0'>
        <div className='row'>
          <div className='col-auto'>
            <span className='me-2'>Oct.</span>
            <Select
              name='octave'
              value={notes.octave}
              options={getOctaves().map((octave) => ({ value: octave, label: octave }))}
              id='octave-select'
              onChange={(e) => setCurrentScale(notes.root, e.currentTarget.value, notes.scaleType)}
            />
          </div>
          <div className='col-auto'>
            <SliderInput
              label='Note length'
              min={boundaries.noteLength.min}
              max={boundaries.noteLength.max}
              step={boundaries.noteLength.step}
              unit={boundaries.noteLength.unit}
              value={params.noteLength}
              onChange={handleParamChange('noteLength')}
              className='mb-2'
            />
            <SliderInput
              label='Interval'
              min={boundaries.interval.min}
              max={boundaries.interval.max}
              step={boundaries.interval.step}
              unit={boundaries.interval.unit}
              value={params.interval}
              onChange={handleParamChange('interval')}
              className='mb-2'
            />
          </div>
        </div>
      </div>
    </div>
  );
}
