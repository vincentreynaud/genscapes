import range from 'lodash/range';
import { AutoFilter, Delay, Reverb } from 'tone';
import { Note, Scale } from '@tonaljs/tonal';
import { initAutoFilterState, initialDelayState, initialReverbState } from '../initialState';
import AutoFilterUi from '../components/modules/AutoFilterUi';
import { ToneAudioEffect } from '../types/audio';
import { EffectName, EffectParamsModule } from '../types/params';
import AutoFilterUiMin from '../components/modules/AutoFilterUiMin';

export function getNoteNames() {
  return Note.names(['C', 'C#', 'Dd', 'D', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']);
}
export function getScaleTypes() {
  return Scale.names();
}
export function getOctaves() {
  return range(1, 8);
}

export const EFFECT_IDS = ['autoFilter', 'reverb', 'delay'];

export const EFFECT_NAMES_MAP = {
  autoFilter: 'Auto Filter',
  reverb: 'Reverb',
  delay: 'Delay',
};

export const MODULES_DISPLAY_NAMES_MAP = {
  polySynth: 'Oscillator',
  autoFilter: 'Auto Filter',
};

export function getTrackParamsBoundaries() {
  return {
    global: {
      volume: {
        min: 0,
        max: 1,
        step: 0.01,
        unit: '',
      },
    },
    autoFilter: {
      frequency: {
        min: 1,
        max: 60,
        step: 0.01,
        unit: 'Hz',
      },
      depth: {
        min: 0,
        max: 1,
        step: 0.001,
        unit: '%',
      },
    },
    polySynth: {
      attack: {
        min: 0.005,
        max: 15,
        step: 0.001,
        unit: 's',
      },
      decay: {
        min: 0.005,
        max: 15,
        step: 0.001,
        unit: 's',
      },
      sustain: {
        min: 0,
        max: 1,
        step: 0.01,
        unit: '%',
      },
      release: {
        min: 0.005,
        max: 15,
        step: 0.001,
        unit: 's',
      },
      detune: {
        min: -50,
        max: 50,
        step: 1,
        unit: 'ct',
      },
      randDetune: {
        min: 0,
        max: 1,
        step: 0.01,
        unit: '%',
      },
      modulationAmount: {
        min: 0,
        max: 1,
        step: 0.01,
        unit: '%',
      },
      modulationRate: {
        min: 1,
        max: 60,
        step: 0.01,
        unit: 'Hz',
      },
    },
  };
}

type EffectUiComponent = typeof AutoFilterUi;
type EffectUiMinComponent = typeof AutoFilterUiMin;

export const mapEffectNameToUiComponent = (): Record<EffectName, EffectUiComponent> => {
  return { autoFilter: AutoFilterUi, reverb: AutoFilterUi, delay: AutoFilterUi };
};

export const mapEffectNameToUiMinComponent = (): Record<EffectName, EffectUiMinComponent> => {
  return { autoFilter: AutoFilterUiMin, reverb: AutoFilterUiMin, delay: AutoFilterUiMin };
};

export const mapEffectNameToToneComponent = (): Record<EffectName, ToneAudioEffect> => {
  return {
    autoFilter: AutoFilter,
    reverb: Reverb,
    delay: Delay,
  };
};

export const mapEffectNameToInitialState = (): Record<EffectName, EffectParamsModule> => {
  return {
    autoFilter: initAutoFilterState(),
    reverb: initialReverbState,
    delay: initialDelayState,
  };
};
