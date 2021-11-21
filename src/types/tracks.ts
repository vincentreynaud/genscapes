import { ToneOscillatorType } from 'tone';
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
  effects: any[];
  composition: {
    noteLength: number;
    randomiseNoteLength: number;
    interval: number;
    randomiseInterval: number;
  };
};
