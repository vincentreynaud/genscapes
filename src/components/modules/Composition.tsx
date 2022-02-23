import React, { useMemo } from 'react';
import ModuleWrapper from '../shared/ModuleWrapper';
import SliderInput from '../shared/SliderInput';
import { TrackCompositionState, UpdateTrackParamHelper } from '../../types/params';
import {
  getNoteNames,
  getOctaves,
  getScaleTypes,
  getTrackParamsBoundaries,
  MODULES_DISPLAY_NAMES_MAP,
} from '../../lib/constants';
import Select from '../shared/Select';

type State = {
  onParamChange: UpdateTrackParamHelper;
  params: TrackCompositionState;
  setCurrentScale: any;
};

const Composition = ({ params, onParamChange, setCurrentScale }: State) => {
  const { notes } = params;
  const { composition: boundaries } = useMemo(() => getTrackParamsBoundaries(), []);

  const handleParamChange = (param) => (value: number) => {
    onParamChange(param, value);
  };

  return (
    <ModuleWrapper id='composition-module' title={MODULES_DISPLAY_NAMES_MAP['composition']}>
      <div className='container-fluid px-0'>
        <div className='row'>
          <div className='col-auto'>
            <h3>Notes</h3>
            <Select
              name='root'
              value={notes.root}
              options={getNoteNames().map((note) => ({ value: note, label: note }))}
              id='root-select'
              onChange={(e) => setCurrentScale(e.currentTarget.value, notes.octave, notes.scaleType)}
            />
            <Select
              name='octave'
              value={notes.octave}
              options={getOctaves().map((octave) => ({ value: octave, label: octave }))}
              id='octave-select'
              onChange={(e) => setCurrentScale(notes.root, e.currentTarget.value, notes.scaleType)}
            />
            <Select
              name='scaleType'
              value={notes.scaleType}
              options={getScaleTypes().map((scale) => ({ value: scale, label: scale }))}
              id='scale-type-select'
              onChange={(e) => setCurrentScale(notes.root, notes.octave, e.currentTarget.value)}
            />
            <div className='my-2' id='notes-display'>
              {notes.scale && notes.scale.join(' ')}
            </div>
          </div>
          <div className='col-auto'>
            <div className='container-fluid px-0'>
              <h3>Timing</h3>
              <div className='row'>
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
                <div className='col-auto'>
                  <SliderInput
                    label='Rand.'
                    min={boundaries.randNoteLength.min}
                    max={boundaries.randNoteLength.max}
                    step={boundaries.randNoteLength.step}
                    unit={boundaries.randNoteLength.unit}
                    value={params.randNoteLength}
                    onChange={handleParamChange('randNoteLength')}
                    className='mb-2'
                  />
                  <SliderInput
                    label='Rand.'
                    min={boundaries.randInterval.min}
                    max={boundaries.randInterval.max}
                    step={boundaries.randInterval.step}
                    unit={boundaries.randInterval.unit}
                    value={params.randInterval}
                    onChange={handleParamChange('randInterval')}
                    className='mb-2'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModuleWrapper>
  );
};

export default Composition;
