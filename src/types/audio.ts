import { AutoFilter, Delay, Gain, LFO, Pattern, PolySynth, Reverb, Synth, Tremolo } from 'tone';

export type AudioState = {
  tracks: Record<number, TrackAudio>;
  global: {
    outputNode: Gain | null;
  };
};

export type TrackAudioNodeType = 'synthNode' | 'synthLfoNode';

export type TrackAudioNode = {
  synthNode?: Synth | PolySynth;
  synthLfoNode?: LFO | Tremolo;
};

export interface TrackAudio extends TrackAudioNode {
  composition?: {
    pattern?: Pattern<string>;
  };
}

export type ToneAudioEffect = typeof AutoFilter | typeof Reverb | typeof Delay;
