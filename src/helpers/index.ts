import { RecursivePartial } from 'tone/build/esm/core/util/Interface';
import toString from 'lodash/toString';
import random from 'lodash/random';
import round from 'lodash/round';
import { initialTrackId } from '../initialState';
import { EffectParamsModule, SourceParamsModule, TracksState, TrackState } from '../types/params';

export const pickRandomElement = (arr: any[] = []) => arr[random(0, arr.length - 1)];

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

export function updateUrlQuery(tracksParams: TracksState) {
  const url = new URL(document.location.href);
  url.searchParams.set('p', JSON.stringify(tracksParams));
  window.history.replaceState({}, 'title', url.href);
}

export function getParamsFromUrl() {
  const url = new URL(document.location.href);
  const p = url.searchParams.get('p');
  return p ? JSON.parse(p) : p;
}

// function with type predicate return type
export function isTracksStateType(p: any): p is TracksState {
  if (!p) {
    return false;
  }
  return p[initialTrackId]?.notes?.root !== undefined && p[initialTrackId]?.composition?.noteLength !== undefined;
}

export function isSourceParamsModule(mod: SourceParamsModule | EffectParamsModule): mod is SourceParamsModule {
  return (mod as SourceParamsModule)?.type === 'source' && (mod as SourceParamsModule)?.tremoloOptions !== undefined;
}
