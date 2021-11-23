import { random, round } from 'lodash';
import { TrackState } from '../types/params';

export function calcMin(value: number, randomisation: number): number {
  return round(value - randomisation * value, 2);
}
export function calcMax(value: number, randomisation: number): number {
  return round(value + randomisation * value, 2);
}

export function getAndFormatRandom(min: number, max: number): number {
  return round(random(min, max, true), 2);
}

export function calcRandom(value: number, randAmount: number) {
  const min = calcMin(value, randAmount);
  const max = calcMax(value, randAmount);
  return getAndFormatRandom(min, max);
}

export function getCurrentNoteLength(composition: TrackState['composition']) {
  const { noteLength, randomiseNoteLength } = composition;
  return calcRandom(noteLength, randomiseNoteLength);
}

export function getCurrentInterval(composition: TrackState['composition']) {
  const { interval, randomiseInterval } = composition;
  return calcRandom(interval, randomiseInterval);
}

export function getCurrentDetune(detune: number, rand: number) {
  return calcRandom(detune, rand);
}

export function clearDoubleHashes(scale: string[]) {
  return scale.map((note) => note.replace(/##/g, '#'));
}
