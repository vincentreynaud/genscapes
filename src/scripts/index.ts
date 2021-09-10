import { getCompressor, getDelay, getFilter, getGain, getOscillator } from "../lib/audio-helpers";
import { Note } from "@tonaljs/tonal";
import { random, round } from "lodash";
import { pickRandomElement } from "../utils";
import { FilterType } from "../types";

window.AudioContext = window.AudioContext || (window as any).webkitAudioContext;

export function setup() {
  const ctx = new AudioContext();

  const compressor = getCompressor(ctx, { threshold: -50, knee: 40, ratio: 12, attack: 0, release: 0.25 });

  const delay = getDelay(ctx, { delayTime: 2.5 });
  const delayGain = getGain(ctx, 0.5);
  const delayFilter = getFilter(ctx, { type: "lowpass", Q: 0, frequency: 500 });

  delay.connect(delayGain).connect(delayFilter).connect(delay);
  delayFilter.connect(compressor).connect(ctx.destination);

  const reverbDelayA = getDelay(ctx, { delayTime: 0.82 });
  const reverbDelayB = getDelay(ctx, { delayTime: 0.73 });
  const reverbGain = getGain(ctx, 0.4);
  const reverbFilter = getFilter(ctx, { type: "lowpass", Q: 0, frequency: 800 });

  reverbGain.connect(reverbDelayA).connect(reverbFilter);
  reverbGain.connect(reverbDelayB).connect(reverbFilter);
  reverbFilter.connect(reverbGain).connect(compressor);

  delayFilter.connect(reverbFilter);

  return { ctx, output: compressor, delay, reverbFilter };
}

export function playDrone(context: SetupReturn, params: DroneParams) {
  const { ctx, output, delay, reverbFilter } = context;
  const {
    notes,
    minLength,
    maxLength,
    droneType,
    droneNextMin,
    droneNextMax,
    droneDetuneMin,
    droneDetuneMax,
    filterType,
    filterQMin,
    filterQMax,
    filterFreqBase,
    filterFreqRampMin,
    filterFreqRampMax,
    filterFreqRampTimeMin,
    filterFreqRampTimeMax,
  } = params;

  const droneLength = round(random(minLength, maxLength, true), 2);
  const droneNextTime = round(random(droneNextMin, droneNextMax, true), 2);

  const randomNote: string = pickRandomElement(notes);
  const frequency = Note.freq(randomNote);
  const detune = random(droneDetuneMin, droneDetuneMax, true);

  const filterQ = random(filterQMin, filterQMax, true);
  const filterFreqRamp = round(random(filterFreqRampMin, filterFreqRampMax, true), 2);
  const filterFreqRampTime = round(random(filterFreqRampTimeMin, filterFreqRampTimeMax, true), 2);
  console.log(`Drone ${randomNote} ${droneLength}s, next in ${droneNextTime}s`);
  console.log(
    "frequency",
    round(frequency as number, 2),
    `ramp ${filterType} filter to`,
    filterFreqRamp,
    `in ${filterFreqRampTime}s`
  );

  let now = ctx.currentTime;
  const oscillator = getOscillator(ctx, { type: droneType, frequency, detune });

  const filter = getFilter(ctx, { type: filterType, frequency: filterFreqBase, Q: filterQ });
  filter.frequency.linearRampToValueAtTime(filterFreqRamp, now + filterFreqRampTime);
  filter.frequency.linearRampToValueAtTime(filterFreqBase, now + droneLength);

  oscillator.connect(filter).connect(delay);
  filter.connect(reverbFilter);
  filter.connect(output);

  now = ctx.currentTime;
  oscillator.start(now);
  oscillator.stop(now + droneLength);

  setTimeout(() => {
    playDrone(context, params);
  }, droneNextTime * 1000);
}

export interface DroneParams {
  notes: string[];
  minLength: number;
  maxLength: number;
  droneType: "custom" | "sawtooth" | "sine" | "square" | "triangle" | undefined;
  droneNextMin: number;
  droneNextMax: number;
  droneDetuneMax: number;
  droneDetuneMin: number;
  filterType: FilterType;
  filterQMin: number;
  filterQMax: number;
  filterFreqBase: number;
  filterFreqRampMin: number;
  filterFreqRampMax: number;
  filterFreqRampTimeMax: number;
  filterFreqRampTimeMin: number;
}

interface SetupReturn {
  ctx: AudioContext;
  output: DynamicsCompressorNode;
  delay: DelayNode;
  reverbFilter: BiquadFilterNode;
}
