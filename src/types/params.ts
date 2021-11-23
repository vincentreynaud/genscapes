import { AutoFilterOptions } from 'tone';
import { NonCustomOscillatorType } from 'tone/build/esm/source/oscillator/OscillatorInterface';

export type GlobalParamsState = {
  playing: boolean;
  volume: number;
};

export type TrackState = {
  signalChain: Array<TrackInstrumentState | TrackEffectState>;
  notes: {
    root: string;
    scaleType: string;
    scaleName: string;
    scale: string[];
    octave: string;
  };
  composition: {
    noteLength: number;
    randomiseNoteLength: number;
    interval: number;
    randomiseInterval: number;
  };
};

export interface ParamComponentBaseState {
  name: EffectName | InstrumentName;
  type: ParamModuleType;
  id?: string;
}

export interface TrackInstrumentState extends ParamComponentBaseState {
  waveform: NonCustomOscillatorType;
  detune: number;
  randomiseDetune: number;
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  modulationAmount: number;
  modulationRate: number;
}

export interface AutoFilterEffectState extends ParamComponentBaseState {
  options: Partial<AutoFilterOptions>;
}

export type TrackEffectState = AutoFilterEffectState;

export type ParamModuleType = 'instrument' | 'effect';
export type EffectName = 'auto-filter' | 'reverb' | 'delay';
export type InstrumentName = 'oscillator' | 'synth';
export type EffectParams = AutoFilterOptions;
