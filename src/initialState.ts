import { nanoid } from '@reduxjs/toolkit';
import { Scale } from '@tonaljs/tonal';
import { Synth } from 'tone';
import { NOTE_NAMES, OCTAVES, SCALE_TYPES } from './lib/constants';
import { AutoFilterParamsModule, EffectParamsModule, SourceParamsModule, TrackState } from './types/params';
import { pickRandomElement } from './helpers';

const root = pickRandomElement(NOTE_NAMES);
const octave = pickRandomElement(OCTAVES).toString();
const scaleType = pickRandomElement(SCALE_TYPES);
const scaleName = `${root}${octave} ${scaleType}`;
const scale = Scale.get(scaleName).notes;

export const initialTrackId: number = 0;

export const initialSourceState: SourceParamsModule = {
  name: 'polySynth',
  type: 'source',
  id: nanoid(),
  options: {
    voice: Synth,
    maxPolyphony: 8,
    options: {
      volume: -12,
      detune: 2,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 5.5,
        decay: 4,
        sustain: 0.8,
        release: 8,
      },
    },
  },
  rand: {
    detune: 0,
  },
  tremoloOptions: {
    amount: 1,
    rate: 30,
  },
};

export const initialTrackState: TrackState = {
  signalChain: [initialSourceState],
  notes: {
    root,
    octave,
    scaleType,
    scaleName,
    scale,
  },
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

export const initialAutoFilterState: AutoFilterParamsModule = {
  name: 'autoFilter',
  type: 'effect',
  options: {
    type: 'sine',
    frequency: 30,
    depth: 1,
    filter: { Q: 1, type: 'lowpass', rolloff: -12 },
  },
};

export const initialReverbState: EffectParamsModule = {
  name: 'reverb',
  type: 'effect',
  options: {},
};

export const initialDelayState: EffectParamsModule = {
  name: 'delay',
  type: 'effect',
  options: {},
};

// {
//   delayAmount: 0,
//   delayTime: 1,
//   delayFeedback: 0,
//   reverbAmount: 0.0,
//   reverbFilterFreq: 250,
//   reverbFilterQ: 0.3,
// }
