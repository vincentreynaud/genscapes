import { AutoFilter, Delay, Gain, LFO, Pattern, PolySynth, Reverb, Synth, Tremolo } from 'tone';
import { ModuleBaseState } from './params';

export type AudioState = {
  tracks: Record<number, TrackAudio>;
  global: {
    outputNode: Gain | null;
  };
};

export type TrackAudioNodeType = 'synthNode' | 'synthLfoNode';

export type TrackAudio = {
  signalChain: Array<AudioModule>; // this is the one that is used for chaining Tone components
  sequ?: {
    pattern?: Pattern<string>;
  };
};
export interface AudioModule extends ModuleBaseState {
  toneNode: ToneSignalNode;
}

export type ToneSignalNode = ToneSourceNode | ToneEffectNode;
export type ToneEffectNode = LFO | AutoFilter | Tremolo | Gain;
export type ToneSourceNode = PolySynth;
export type ToneAudioEffect = typeof AutoFilter | typeof Reverb | typeof Delay | typeof Tremolo;
