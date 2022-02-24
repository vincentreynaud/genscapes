import { nanoid } from '@reduxjs/toolkit';
import { Scale } from '@tonaljs/tonal';
import { Synth } from 'tone';
import { getNoteNames, getOctaves, getScaleTypes } from './lib/constants';
import { AutoFilterParamsModule, EffectParamsModule, SourceParamsModule, TrackState } from './types/params';
import { pickRandomElement } from './helpers';
import { AudioState } from './types/audio';

export const initialTrackId: number = 0;

export function initNotes() {
  const root = pickRandomElement(getNoteNames());
  const octave = pickRandomElement(getOctaves()).toString();
  const scaleType = pickRandomElement(getScaleTypes());
  const scaleName = `${root}${octave} ${scaleType}`;
  const scale = Scale.get(scaleName).notes;
  return { root, octave, scaleType, scaleName, scale };
}

export function initSourceState(): SourceParamsModule {
  return {
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
}

export function initTrackState(): TrackState {
  return {
    signalChain: [initSourceState()],
    composition: {
      notes: initNotes(),
      noteLength: 10,
      randNoteLength: 0.8,
      interval: 8,
      randInterval: 0.8,
    },
  };
}

export function initAudioState() {
  return {
    tracks: {
      [initialTrackId]: initTrackAudioState(),
    },
    global: {
      outputNode: null,
    },
  } as AudioState;
}

export function initTrackAudioState() {
  return {
    signalChain: [],
    composition: {},
  };
}

export function initParamsState() {
  return {
    global: {
      playing: false,
      volume: 0.5,
    },
    tracks: {
      [initialTrackId]: initTrackState(),
    },
  };
}

export function initAutoFilterState(): AutoFilterParamsModule {
  return {
    name: 'autoFilter',
    type: 'effect',
    options: {
      type: 'sine',
      frequency: 30,
      depth: 1,
      filter: { Q: 1, type: 'lowpass', rolloff: -12 },
    },
  };
}

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
