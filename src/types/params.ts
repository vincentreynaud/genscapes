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

export interface ModuleBaseState {
  name: ModuleName;
  type: ModuleType;
  id?: string;
}

export interface TrackInstrumentState extends ModuleBaseState {
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

export type ModuleName = EffectName | InstrumentName;
export interface AutoFilterEffectState extends ModuleBaseState {
  options: Partial<AutoFilterOptions>;
}

export type TrackEffectState = AutoFilterEffectState;

export type ModuleType = 'source' | 'effect';
export type ModuleId = string;
export type EffectName = 'autoFilter' | 'reverb' | 'delay';
export type InstrumentName = 'oscillator' | 'synth' | 'polySynth';
export type EffectParams = AutoFilterOptions;
