import { RecursivePartial } from 'tone/build/esm/core/util/Interface';
import toString from 'lodash/toString';
import random from 'lodash/random';
import round from 'lodash/round';
import every from 'lodash/every';
import {
  EffectParamsModule,
  PolySynthParamsModule,
  SourceParamsModule,
  TracksState,
  TrackState,
} from '../types/params';

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

export function getCurrentNoteLength(sequ: TrackState['sequ']) {
  const { noteLength, randNoteLength } = sequ;
  return calcRandom(noteLength, randNoteLength);
}

export function getCurrentInterval(sequ: TrackState['sequ']) {
  const { interval, randInterval } = sequ;
  return calcRandom(interval, randInterval);
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
  const keys = Object.keys(p);
  const areTracksCompoStateValid = keys.map((key) => p[key]?.sequ?.noteLength !== undefined);
  const areTracksNotesStateValid = keys.map((key) => {
    return p[key]?.sequ?.notes?.scaleName !== undefined;
  });
  const checks = [...areTracksCompoStateValid, ...areTracksNotesStateValid];
  return every(checks, (check) => check === true);
}

export function isSourceParamsModule(mod: SourceParamsModule | EffectParamsModule): mod is SourceParamsModule {
  return (mod as SourceParamsModule)?.type === 'source' && (mod as SourceParamsModule)?.tremoloOptions !== undefined;
}

export function isPolySynthParamsModule(mod: SourceParamsModule): mod is PolySynthParamsModule {
  return isSourceParamsModule(mod) && mod.name === 'polySynth';
}
