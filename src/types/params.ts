import { AutoFilterOptions, PolySynthOptions, Synth } from 'tone';
import { RecursivePartial } from 'tone/build/esm/core/util/Interface';
import { NonCustomOscillatorType } from 'tone/build/esm/source/oscillator/OscillatorInterface';

export type GlobalParamsState = {
  playing: boolean;
  volume: number;
};

export type ModuleName = EffectName | SourceName;
export type ModuleType = 'source' | 'effect';
export type ModuleField = 'options' | 'rand' | 'tremoloOptions';
export type TrackField = 'composition' | 'notes';
export type ModuleId = string;
export type ModuleOptions = PartialEffectOptions | PartialSourceOptions;
export type ModuleRandParams = SourceRandParams;
export type EffectName = 'autoFilter' | 'reverb' | 'delay';
export type SourceName = 'oscillator' | 'synth' | 'polySynth';
export type PartialEffectOptions = Partial<AutoFilterOptions>;
export type SourceOptions = PolySynthOptions<Synth>;
export type PartialSourceOptions = Partial<PolySynthOptions<Synth>>;
export type SourceRandParams = { detune: number };

export interface ModuleBaseState {
  name: ModuleName;
  type: ModuleType;
  id?: string;
}

export interface ParamsModule<Options, Rand = {}> extends ModuleBaseState {
  options: Options;
  rand?: Rand;
}

export type EffectParamsModule = AutoFilterParamsModule;
export type SourceParamsModule = PolySynthParamsModule;
export type AutoFilterParamsModule = ParamsModule<Partial<AutoFilterOptions>>;
export interface PolySynthParamsModule extends ParamsModule<PartialSourceOptions, SourceRandParams> {
  tremoloOptions: {
    amount: number;
    rate: number;
  };
}

export type TrackState = {
  signalChain: Array<SourceParamsModule | EffectParamsModule>;
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
