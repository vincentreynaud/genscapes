import React from 'react';
import ModuleWrapper from './ModuleWrapper';
import DraggableRangeInput from './DraggableRangeInput';
import { TrackCompositionState, UpdateTrackParamHelper } from '../types/params';
import { getNoteNames, getOctaves, getScaleTypes } from '../lib/constants';

type State = {
  onParamChange: UpdateTrackParamHelper;
  params: TrackCompositionState;
  setCurrentScale: any;
};

const CompositionModule = ({ params, onParamChange, setCurrentScale }: State) => {
  const { notes } = params;
  const handleParamChange = (param) => (value: number) => {
    onParamChange(param, value);
  };

  return (
    <ModuleWrapper id='composition-module' title='Composition'>
      <div className='container-fluid px-0'>
        <div className='row'>
          <div className='col-auto'>
            <h3>Notes</h3>
            <select
              name='root'
              id='root-select'
              value={notes.root}
              onChange={(e) => setCurrentScale(e.currentTarget.value, notes.octave, notes.scaleType)}
            >
              {getNoteNames().map((note, i) => (
                <option value={note} key={i}>
                  {note}
                </option>
              ))}
            </select>
            <select
              name='octave'
              id='octave-select'
              value={notes.octave}
              onChange={(e) => setCurrentScale(notes.root, e.currentTarget.value, notes.scaleType)}
            >
              {getOctaves().map((octave) => (
                <option value={octave.toString()} key={octave}>
                  {octave}
                </option>
              ))}
            </select>
            <select
              name='scaleType'
              id='scale-type-select'
              value={notes.scaleType}
              onChange={(e) => setCurrentScale(notes.root, notes.octave, e.currentTarget.value)}
            >
              {getScaleTypes().map((scale, i) => (
                <option value={scale} key={i}>
                  {scale}
                </option>
              ))}
            </select>
            <div className='my-2' id='notes-display'>
              {notes.scale && notes.scale.join(' ')}
            </div>
          </div>
          <div className='col-auto'>
            <div className='container-fluid px-0'>
              <h3>Timing</h3>
              <div className='row'>
                <div className='col-auto'>
                  <DraggableRangeInput
                    label='Note length'
                    min={0.2}
                    max={48}
                    step={0.1}
                    unit='s'
                    value={params.noteLength}
                    onChange={handleParamChange('noteLength')}
                    className='mb-2'
                  />
                  <DraggableRangeInput
                    label='Rand.'
                    min={0}
                    max={1}
                    step={0.01}
                    unit='%'
                    value={params.randomiseNoteLength}
                    onChange={handleParamChange('randomiseNoteLength')}
                    className='mb-2'
                  />
                </div>
                <div className='col-auto'>
                  <DraggableRangeInput
                    label='Interval'
                    min={0}
                    max={48}
                    step={0.1}
                    unit='s'
                    value={params.interval}
                    onChange={handleParamChange('interval')}
                    className='mb-2'
                  />
                  <DraggableRangeInput
                    label='Rand.'
                    min={0}
                    max={1}
                    step={0.01}
                    unit='%'
                    value={params.randomiseInterval}
                    onChange={handleParamChange('randomiseInterval')}
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

export default CompositionModule;
