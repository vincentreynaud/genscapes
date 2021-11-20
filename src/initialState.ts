import { Scale } from '@tonaljs/tonal';
import { Pattern, PolySynth } from 'tone';
import { NOTE_NAMES, OCTAVES, SCALE_TYPES } from './lib/constants';
import { pickRandomElement } from './utils';

export type TrackState = {
  instrument: {
    name: string;
    waveform: string;
    attack: number;
    sustain: number;
    release: number;
    modulationAmount: number;
    modulationRate: number;
  };
  notes: {
    root: string;
    scaleType: string;
    scaleName: string;
    scale: string[];
    octave: string;
    randomiseDetune: number;
    detune: number;
  };
  effects: any[];
  composition: {
    noteLength: number;
    randomiseNoteLength: number;
    interval: number;
    randomiseInterval: number;
  };
};

const root = pickRandomElement(NOTE_NAMES);
const octave = pickRandomElement(OCTAVES).toString();
const scaleType = pickRandomElement(SCALE_TYPES);
const scaleName = `${root}${octave} ${scaleType}`;
const scale = Scale.get(scaleName).notes;

export const initialTrackState: TrackState = {
  instrument: {
    name: 'oscillator',
    waveform: 'sine',
    attack: 0.3,
    sustain: 0.8,
    release: 0.3,
    modulationAmount: 0.2,
    modulationRate: 25,
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
    noteLength: 3,
    randomiseNoteLength: 0,
    interval: 2,
    randomiseInterval: 0,
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
