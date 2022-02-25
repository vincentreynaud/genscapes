import { filter } from 'lodash';
import { Pattern, PolySynth, Tremolo } from 'tone';
import { calcRandom as calcRand, isPolySynthParamsModule, isSourceParamsModule } from '.';
import { ToneSignalNode } from '../types/audio';
import { TrackCompositionState, TracksState, TrackState } from '../types/params';
import * as Tone from 'tone';

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

export function updateAudioState(tracks: TracksState) {
  const trackIds = Object.keys(tracks);
  trackIds.forEach((key) => {
    let source: ToneSignalNode | null = null;
    const [sourceParams]: any[] = getModsByType(tracks[key], 'source');
    if (sourceParams && isPolySynthParamsModule(sourceParams)) {
      const { detune } = sourceParams.options.options as any;
      const randDetune = sourceParams.rand?.detune;
      const compoParams = tracks[key].sequ;
      source = createPolySynth(sourceParams.options, sourceParams.tremoloOptions);
      // .connect(out);
      // assuming we now have a source
      const compo = setPattern(source, { ...compoParams, detune, randDetune });
      // audio.push({ source, compo });
    }
  });
}

function triggerPatternNote(source, params) {
  const { noteLength, randNoteLength, interval, randInterval, detune, randDetune } = params;
  return (time, note) => {
    const length = calcRand(noteLength, randNoteLength);
    const intr = calcRand(interval, randInterval);
    const currentDetune = calcRand(detune, randDetune);
    source.set({ detune: currentDetune });
    source.triggerAttackRelease(note, length, time + intr);
    console.log(note, 'interval', intr, 'noteLength', length);
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
