import { filter, toNumber } from 'lodash';
import { Gain, Pattern, PolySynth, Tremolo } from 'tone';
import { calcRandom as calcRand, isPolySynthParamsModule, isSourceParamsModule } from '.';
import { AudioModule, ToneSignalNode, ToneSourceNode } from '../types/audio';
import {
  ModuleId,
  ModuleName,
  ModuleType,
  PolySynthParamsModule,
  TrackCompositionState,
  TracksState,
  TrackState,
} from '../types/params';
import * as Tone from 'tone';
import { addTrack, chainTrackAudioComponent } from '../reducers/audio';
import store from '../store';

export function getModsByType(track: TrackState, type) {
  const mods = filter(track.signalChain, (mod) => mod.type === type);
  return mods.map((mod) => {
    if (isSourceParamsModule(mod)) {
      return mod;
    } else {
      return mod;
    }
  });
}

export function createPolySynth(synthOpts, modOpts) {
  const lfo = new Tremolo(modOpts.rate, modOpts.amount).start();
  const source = new PolySynth(synthOpts);
  source.connect(lfo);
  return source;
}

export function createPolySynthAudioFromParams(params: PolySynthParamsModule, out) {
  const source = createPolySynth(params.options, params.tremoloOptions).connect(out);
  return source;
}

export function createAudioModule(name: ModuleName, type: ModuleType, id: ModuleId, toneNode): AudioModule {
  return { name, type, id, toneNode };
}

export function setCompoFromParams(params: PolySynthParamsModule, compoParams, source: ToneSourceNode) {
  const { detune } = params?.options?.options as any;
  const randDetune = params.rand?.detune;
  const compo = setPattern(source, { ...compoParams, detune, randDetune });
  return compo;
}

// [!] need for thunk implementation
export function updateAudioState(tracks: TracksState, out: Gain<'gain'>, chain: typeof chainTrackAudioComponent) {
  const state = store.getState();
  const trackIds = Object.keys(tracks);
  trackIds.forEach((key) => {
    if (!state.audio.tracks[key]) {
      store.dispatch(addTrack(toNumber(key)));
    }
    let source: ToneSignalNode | null = null;
    const [sourceParams]: any[] = getModsByType(tracks[key], 'source');
    if (sourceParams && isPolySynthParamsModule(sourceParams)) {
      const { name, type, id } = sourceParams;
      // if source already exists, disconnect it + replace it
      source = createPolySynthAudioFromParams(sourceParams, out);
      setCompoFromParams(sourceParams, tracks[key].sequ, source);
      const mod = createAudioModule(name, type, id!, source);
      store.dispatch(chain(key, mod));
    }
    // same for effects
  });
}

export function startComposer(compo) {
  console.log(Tone.Transport.context.state);
  if (Tone.Transport.context.state !== 'running') {
    Tone.Transport.context.resume();
    console.log('Transport.resume()');
  }
  Tone.Transport.start();
  compo.start();
  console.log(compo.state);
}

export function stopComposer(compo) {
  compo?.stop();
  console.log(compo?.state);
  Tone.Transport.pause();
}

function triggerPatternNote(source, params) {
  const { noteLength, randNoteLength, interval, randInterval, detune, randDetune } = params;
  return (time, note) => {
    const length = calcRand(noteLength, randNoteLength);
    const intr = calcRand(interval, randInterval);
    const currentDetune = calcRand(detune, randDetune);
    if (source) {
      source.set({ detune: currentDetune });
      source.triggerAttackRelease(note, length, time + intr);
      console.log(note, 'interval', intr, 'noteLength', length);
    } else {
      console.error(`source is ${typeof source}`);
    }
    // cb(time + intr);
  };
}

// Update pattern
export function setPattern(source, params: TrackCompositionState) {
  const { interval, randInterval } = params;
  const { scale } = params.notes;
  // let noteTime = 0; // I AM CONSCIOUSLY USING A CLOSURE!!!!!
  // function updateNoteTime(time) {
  //   noteTime = time;
  // }
  const pattern = new Pattern({
    callback: triggerPatternNote(source, params),
    interval: calcRand(interval, randInterval),
    values: scale,
    pattern: 'random',
  });
  console.log('pattern set');

  return pattern;
}
