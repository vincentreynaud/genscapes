import { Note } from "@tonaljs/tonal";
import { round } from "lodash";

export type DelayOptions = {
  delayTime?: number;
};

export type FilterOptions = {
  type?: BiquadFilterType;
  Q?: number;
  frequency?: number;
};

export type CompressorOptions = {
  threshold?: number;
  knee?: number;
  ratio?: number;
  attack?: number;
  release?: number;
};

export type OscillatorOptions = {
  type?: OscillatorType;
  frequency?: number | null;
  detune?: number;
};

export const defaultDelayOptions: DelayOptions = { delayTime: 1 };
export const defaultFilterOptions: FilterOptions = { type: "lowpass", Q: 0, frequency: 1000 };
export const defaultCompressorOptions: CompressorOptions = {
  threshold: -24,
  knee: 40,
  ratio: 12,
  attack: 0,
  release: 0.25,
};

export function getGain(ctx: AudioContext, value: number = 0.8) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(value, ctx.currentTime);
  return gain;
}

export function getDelay(ctx: AudioContext, options = defaultDelayOptions) {
  const delay = ctx.createDelay();
  const initOptions = { ...defaultDelayOptions, ...options };
  (Object.keys(initOptions) as Array<keyof DelayOptions>).forEach((key) => {
    delay[key].setValueAtTime(initOptions[key]!, ctx.currentTime);
  });

  return delay;
}

export function getFilter(ctx: AudioContext, options = defaultFilterOptions) {
  const filter = ctx.createBiquadFilter();
  const initOptions = { ...defaultFilterOptions, ...options };
  filter.type = initOptions.type!;
  (["Q", "frequency"] as Array<"Q" | "frequency">).forEach((key) => {
    filter[key].setValueAtTime(initOptions[key]!, ctx.currentTime);
  });

  return filter;
}

export function getCompressor(ctx: AudioContext, options = defaultCompressorOptions) {
  const compressor = ctx.createDynamicsCompressor();
  const initOptions = { ...defaultCompressorOptions, ...options };
  (Object.keys(initOptions) as Array<keyof CompressorOptions>).forEach((key) => {
    compressor[key].setValueAtTime(initOptions[key]!, ctx.currentTime);
  });

  return compressor;
}

export function getOscillator(ctx: AudioContext, { type = "sine", frequency = 1000, detune = 0 }: OscillatorOptions) {
  const oscillator = ctx.createOscillator();
  const options = { frequency, detune };
  oscillator.type = type;
  (Object.keys(options) as Array<"frequency" | "detune">).forEach((key) => {
    oscillator[key].setValueAtTime(options[key]!, ctx.currentTime);
  });

  return oscillator;
}

export function getFreq(note: string) {
  return round(Note.freq(note) as number, 2);
}
