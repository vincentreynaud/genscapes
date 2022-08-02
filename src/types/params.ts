import { AutoFilterOptions, EnvelopeCurve, PolySynthOptions, Synth } from 'tone';
import { Time } from 'tone/build/esm/core/type/Units';

export type ParamsState = {
  global: GlobalParamsState;
  tracks: TracksState;
};

export type GlobalParamsState = {
  playing: boolean;
  volume: number;
};

export type ModuleName = EffectName | SourceName;
export type ModuleType = 'source' | 'effect';
export type ModuleField = 'options' | 'rand' | 'tremoloOptions';
export type TrackField = 'sequ' | 'notes';
export type TrackId = number;
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

export type TracksState = Record<number, TrackState>;

export type TrackState = {
  signalChain: Array<SourceParamsModule | EffectParamsModule>;
  sequ: TrackCompositionState;
};

export type TrackCompositionState = {
  notes: {
    root: string;
    scaleType: string;
    scaleName: string;
    scale: string[];
    octave: string;
  };
  noteLength: number;
  randNoteLength: number;
  interval: number;
  randInterval: number;
};

export type AddEffectPayload = {
  trackId: number;
  effect: EffectParamsModule;
};

export type UpdateTrackParamPayload = {
  trackId: number;
  path: string;
  value: TrackParamValue;
};

export type UpdateModuleParamPayload = {
  trackId: number;
  modId: ModuleId;
  path: string;
  value: ModuleParamValue;
};

export type UpdateAllParamsPayload = {
  value: any;
};

export type UpdateModuleParamHelper = (modId: ModuleId, path: string, value: ModuleParamValue) => void;

export type UpdateTrackParamHelper = (path: string, value: TrackParamValue) => void;

export type ModuleParamValue = number | string | Record<string, number | Time | string | EnvelopeCurve>;

export type TrackParamValue = number | string | string[];
