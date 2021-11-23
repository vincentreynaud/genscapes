import React from 'react';
import { NOTE_NAMES, OCTAVES, SCALE_TYPES } from '../lib/constants';
import { TrackState } from '../types/params';
import ModuleWrapper from './ModuleWrapper';

type State = {
  onParamChange: (module, param, value) => void;
  notes: TrackState['notes'];
  setCurrentScale: any;
};

const NotesModule = ({ notes, onParamChange, setCurrentScale }: State) => {
  const handleParamChange = (param) => (value: number) => {
    onParamChange('notes', param, value);
  };

  return (
    <ModuleWrapper id='notes-options' title='Notes'>
      <select
        name='root'
        id='root-select'
        value={notes.root}
        onChange={(e) => setCurrentScale(e.currentTarget.value, notes.octave, notes.scaleType)}
      >
        {NOTE_NAMES.map((note, i) => (
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
        {OCTAVES.map((octave) => (
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
        {SCALE_TYPES.map((scale, i) => (
          <option value={scale} key={i}>
            {scale}
          </option>
        ))}
      </select>
      <div className='my-2' id='notes-display'>
        {notes.scale && notes.scale.join(' ')}
      </div>
    </ModuleWrapper>
  );
};

export default NotesModule;
