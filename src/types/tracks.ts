import { AutoFilterOptions, ToneOscillatorType } from 'tone';
import { NonCustomOscillatorType } from 'tone/build/esm/source/oscillator/OscillatorInterface';

export type TrackState = {
  instrument: {
    name: string;
    waveform: NonCustomOscillatorType;
    envelope: {
      attack: number;
      decay: number;
      sustain: number;
      release: number;
    };
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
  effects: TrackEffect[];
  composition: {
    noteLength: number;
    randomiseNoteLength: number;
    interval: number;
    randomiseInterval: number;
  };
};

export type TrackEffect = AutoFilterEffect;
export type EffectId = 'auto-filter' | 'reverb' | 'delay';
export type EffectParams = AutoFilterOptions;

export interface TrackEffectBase {
  id: EffectId;
}

export interface AutoFilterEffect extends TrackEffectBase {
  options: Partial<AutoFilterOptions>;
}
