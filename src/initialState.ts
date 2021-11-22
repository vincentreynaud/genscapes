import { Scale } from '@tonaljs/tonal';
import { NOTE_NAMES, OCTAVES, SCALE_TYPES } from './lib/constants';
import { AutoFilterEffect, TrackState } from './types/params';
import { pickRandomElement } from './utils';

const root = pickRandomElement(NOTE_NAMES);
const octave = pickRandomElement(OCTAVES).toString();
const scaleType = pickRandomElement(SCALE_TYPES);
const scaleName = `${root}${octave} ${scaleType}`;
const scale = Scale.get(scaleName).notes;

export const initialTrackId = 0;

export const initialTrackState: TrackState = {
  instrument: {
    name: 'oscillator',
    waveform: 'sine',
    envelope: {
      attack: 5.5,
      decay: 4,
      sustain: 0.8,
      release: 8,
    },
    modulationAmount: 1,
    modulationRate: 30,
  },
  notes: {
    root,
    octave,
    scaleType,
    scaleName,
    scale,
    randomiseDetune: 0.2,
    detune: 2,
  },
  effects: [],
  composition: {
    noteLength: 10,
    randomiseNoteLength: 0.8,
    interval: 8,
    randomiseInterval: 0.8,
  },
};

export const initialParamsState = {
  global: {
    playing: false,
    volume: 0.5,
  },
  tracks: {
    [initialTrackId]: initialTrackState,
  },
};

export const initialAutoFilterState: AutoFilterEffect = {
  id: 'auto-filter',
  options: {
    type: 'sine',
    frequency: 30,
    depth: 1,
  },
};

// {
//   delayAmount: 0,
//   delayTime: 1,
//   delayFeedback: 0,
//   reverbAmount: 0.0,
//   reverbFilterFreq: 250,
//   reverbFilterQ: 0.3,
// }
