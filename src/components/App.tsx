import { memo, useCallback, useEffect, useMemo } from 'react';
import * as Tone from 'tone';
import { AutoFilter, Delay, Gain, Pattern, PolySynth, Reverb, Tremolo } from 'tone';
import { Scale } from '@tonaljs/tonal';
import RangeInput from './RangeInput';
import NotesModule from './NotesModule';
import InstrumentModule from './InstrumentModule';
import CompositionModule from './CompositionModule';
import {
  updateModuleParam as updateModuleParam,
  addEffect,
  setGlobalParam,
  setPlay,
  updateTrackParam,
  updateAllParams,
} from '../reducers/params';
import { setGlobalAudioComponent, chainTrackAudioComponent, setTrackCompositionComponent } from '../reducers/audio';
import {
  clearDoubleHashes,
  getCurrentDetune,
  getCurrentInterval,
  getCurrentNoteLength,
  getParamsFromUrl,
  isTracksStateType,
  updateUrlQuery,
} from '../helpers';
import { useAppSelector, useAppDispatch, useWhatChanged } from '../hooks';
import '../styles/index.scss';
import AddButton from './AddButton';
import AutoFilterModule from './AutoFilterModule';
import {
  EffectName,
  EffectParamsModule,
  TrackField,
  TrackState,
  SourceParamsModule,
  UpdateModuleParamHelper,
  PolySynthParamsModule,
} from '../types/params';
import { initialAutoFilterState, initialDelayState, initialReverbState } from '../initialState';
import { ToneAudioEffect } from '../types/audio';
import {
  makeSelectAudioModuleByType,
  makeSelectParamModuleByType,
  makeSelectToneNodesByType,
  makeSelectTrackAudio,
  makeSelectTrackParams,
  selectGlobalAudio,
  selectGlobalParams,
  SelectSourceNodes,
  selectTracksParams,
} from '../selectors';
import { nanoid } from '@reduxjs/toolkit';
import { find } from 'lodash';

type EffectUiComponent = typeof AutoFilterModule;

const mapEffectNameToUiComponent: Record<EffectName, EffectUiComponent> = {
  autoFilter: AutoFilterModule,
  reverb: AutoFilterModule,
  delay: AutoFilterModule,
};

const mapEffectNameToToneComponent: Record<EffectName, ToneAudioEffect> = {
  autoFilter: AutoFilter,
  reverb: Reverb,
  delay: Delay,
};

const mapEffectNameToInitialState: Record<EffectName, EffectParamsModule> = {
  autoFilter: initialAutoFilterState,
  reverb: initialReverbState,
  delay: initialDelayState,
};

const App = memo(() => {
  const trackId = 0;
  const dispatch = useAppDispatch();
  const selectEffectsParams = useMemo(() => makeSelectParamModuleByType(trackId, 'effect'), [trackId]);
  const selectSourceParams = useMemo(() => makeSelectParamModuleByType(trackId, 'source'), [trackId]);
  const selectSourceNodes = useMemo(() => makeSelectToneNodesByType(trackId, 'source'), [trackId]) as SelectSourceNodes;
  const selectEffectNodes = useMemo(() => makeSelectToneNodesByType(trackId, 'effect'), [trackId]);
  const selectEffectAudioModules = useMemo(() => makeSelectAudioModuleByType(trackId, 'effect'), [trackId]);
  const selectTrackParams = useMemo(() => makeSelectTrackParams(trackId), [trackId]);
  const selectTrackAudio = useMemo(() => makeSelectTrackAudio(trackId), [trackId]);
  const globalParams = useAppSelector(selectGlobalParams);
  const globalAudio = useAppSelector(selectGlobalAudio);
  const tracksParams = useAppSelector(selectTracksParams);
  const trackParams = useAppSelector((state) => selectTrackParams(state));
  const trackAudio = useAppSelector((state) => selectTrackAudio(state));
  const { playing, volume } = globalParams;
  const { outputNode } = globalAudio;
  const { notes, composition: compositionParams } = trackParams;
  const { scale } = notes;
  const { signalChain, composition } = trackAudio;
  const [sourceParams] = useAppSelector((state) => selectSourceParams(state));
  const effectsParams = useAppSelector((state) => selectEffectsParams(state));
  const [sourceNode] = useAppSelector((state) => selectSourceNodes(state));
  const effectAudioModules = useAppSelector((state) => selectEffectAudioModules(state));
  const effectNodes = useAppSelector((state) => selectEffectNodes(state));
  const {
    options: {
      options: {
        detune,
        oscillator: { type: waveform },
        envelope: { attack, decay, release, sustain },
      },
    },
    tremoloOptions: { rate: modulationRate, amount: modulationAmount },
    rand: { detune: randomiseDetune },
  } = sourceParams as any; // just to make it shut up for now

  // init component
  useEffect(() => {
    const outputNode = new Gain(volume).toDestination();
    const synthLfoNode = new Tremolo(modulationRate, modulationAmount).start();
    const sourceNode = new PolySynth(sourceParams.options);
    sourceNode.chain(synthLfoNode, outputNode);

    const synthModule = {
      name: 'polySynth',
      type: 'source',
      id: sourceParams.id,
      toneNode: sourceNode,
    };
    const lfoModule = { name: 'tremolo', type: 'effect', id: sourceParams.id, toneNode: synthLfoNode };

    dispatch(setGlobalAudioComponent('outputNode', outputNode));
    // TODO: RESET SIGNAL CHAIN ON NEW SOURCE SET UP
    dispatch(chainTrackAudioComponent(trackId, synthModule));
    dispatch(chainTrackAudioComponent(trackId, lfoModule));
    console.log('init');
  }, []);

  useEffect(() => {
    const value = getParamsFromUrl();
    if (!isTracksStateType(value)) {
      console.error("Prevented state update because the url query params structure differs from the app's state one");
    } else {
      dispatch(updateAllParams({ value }));
    }
  }, []);

  useEffect(() => {
    updateUrlQuery(tracksParams);
  }, [tracksParams]);

  const handleChangeTrackParam = (field: TrackField, param, value, paramGroup = '') => {
    dispatch(updateTrackParam({ trackId, field, param, value, paramGroup }));
  };

  // useCallback will be necessary when the tracks change
  const handleChangeModuleParam: UpdateModuleParamHelper = (modId, path, value) => {
    dispatch(updateModuleParam({ trackId, modId, path, value }));
  };

  const [changedParamsMod]: TrackState['signalChain'] = useWhatChanged([sourceParams, ...effectsParams]);

  function isSourceParamsModule(mod: SourceParamsModule | EffectParamsModule): mod is SourceParamsModule {
    return (mod as SourceParamsModule)?.tremoloOptions !== undefined; // find if from instance instead
  }

  // Update tone nodes on module param changes
  useEffect(() => {
    if (isSourceParamsModule(changedParamsMod)) {
      if (sourceNode && changedParamsMod) {
        console.log('updating source node', changedParamsMod);
        sourceNode.set(changedParamsMod.options.options || {});
      }
    } else {
      const effectMod = find(effectAudioModules, (node) => node.id === changedParamsMod?.id);
      if (effectMod) {
        console.log('updating effect node', changedParamsMod);
        effectMod.toneNode.set(changedParamsMod.options || {});
      }
    }
  }, [sourceParams, effectsParams, sourceNode, effectAudioModules]);

  const togglePlay = useCallback(() => {
    if (!playing) {
      dispatch(setPlay(true));
    } else {
      dispatch(setPlay(false));
    }
  }, [playing, dispatch]);

  const startComposition = useCallback(() => {
    Tone.Transport.start();
    if (composition?.pattern) {
      composition.pattern.start();
    } else {
      console.log('pattern not set!');
    }
  }, [composition?.pattern]);

  const stopComposition = useCallback(() => {
    if (composition?.pattern) {
      composition.pattern.stop();
    } else {
      console.log('pattern not set!');
    }
    Tone.Transport.pause();
  }, [composition?.pattern]);

  // toggle composition playback
  useEffect(() => {
    if (playing) {
      startComposition();
    } else {
      stopComposition();
      sourceNode?.releaseAll();
    }
  }, [playing, startComposition, stopComposition, sourceNode]);

  // Change master volume
  useEffect(() => {
    if (outputNode) {
      outputNode.set({ gain: volume });
    } else {
      console.error('master volume is null');
    }
  }, [outputNode, volume]);

  const triggerPatternNote = useCallback(
    (time, note) => {
      const noteLength = getCurrentNoteLength(compositionParams);
      const interval = getCurrentInterval(compositionParams);
      const currentDetune = getCurrentDetune(detune, randomiseDetune);
      console.log(note, currentDetune, 'interval', interval, 'noteLength', noteLength);
      sourceNode?.set({ detune: currentDetune });
      sourceNode?.triggerAttackRelease(note, noteLength, time + interval);
    },
    [sourceNode, compositionParams, detune, randomiseDetune]
  );

  // Update pattern
  useEffect(() => {
    console.log('init pattern');
    const pattern = new Pattern({
      callback: triggerPatternNote,
      interval: getCurrentInterval(compositionParams),
      values: scale,
      pattern: 'random',
    });
    handleChangeComposition('pattern', pattern);
    return () => {
      handleChangeComposition('pattern', null);
    };
  }, [compositionParams, scale, triggerPatternNote]);

  // Continue playing pattern on change
  useEffect(() => {
    if (playing) {
      startComposition();
    }
  }, [composition?.pattern]);

  function setCurrentScale(note: string, octave: string, scaleType: string) {
    const scaleName = `${note}${octave} ${scaleType}`;
    const scale = clearDoubleHashes(Scale.get(scaleName).notes);
    handleChangeTrackParam('notes', 'root', note);
    handleChangeTrackParam('notes', 'octave', octave);
    handleChangeTrackParam('notes', 'scaleType', scaleType);
    handleChangeTrackParam('notes', 'scaleName', scaleName);
    handleChangeTrackParam('notes', 'scale', scale);
    if (composition?.pattern) {
      composition.pattern.set({ values: scale });
    }
  }

  const handleChangeGlobalParam = (value: number) => {
    dispatch(setGlobalParam('volume', value));
  };

  const handleChangeComposition = (key: 'pattern', value: Pattern<string> | null) => {
    if (playing) {
      stopComposition();
      value?.dispose(); // is that right?
    }
    dispatch(setTrackCompositionComponent(trackId, key, value));
  };

  const handleAddEffect = useCallback(
    (name: EffectName) => {
      if (!name) return;
      if (outputNode) {
        const id = nanoid();
        const effectState = mapEffectNameToInitialState[name];
        const ToneEffect = mapEffectNameToToneComponent[name];
        const toneEffectNode = new ToneEffect();
        toneEffectNode.set(effectState.options);
        sourceNode.disconnect();
        sourceNode.chain(...effectNodes, outputNode);
        dispatch(addEffect(trackId, { id, ...effectState }));
        dispatch(chainTrackAudioComponent(trackId, { name, id, type: 'effect', toneNode: toneEffectNode }));
      } else {
        console.error('store output node is null');
      }
    },
    [dispatch, sourceNode, effectNodes, outputNode]
  );

  const handleDeleteEffect = (effectName: string) => {};

  return (
    <div className='content'>
      <div id='main-controls'>
        <button id='play-button' className='btn btn-dark' onClick={togglePlay}>
          {playing ? 'Stop' : 'Start'}
        </button>
        <div id='volume'>
          <RangeInput label='' min={0} max={1} step={0.1} unit='' value={volume} onChange={handleChangeGlobalParam} />
        </div>
      </div>
      <section className='container-fluid'>
        <div className='row'>
          <InstrumentModule onParamChange={handleChangeModuleParam} params={sourceParams as PolySynthParamsModule} />
          {effectsParams.map((effect, i) => {
            const Component = mapEffectNameToUiComponent[effect.name];
            return (
              <Component
                params={effect}
                onParamChange={handleChangeModuleParam}
                onDelete={handleDeleteEffect}
                key={i}
              />
            );
          })}
          <AddButton onAdd={handleAddEffect} />
        </div>
      </section>
      <section className='container-fluid'>
        <div className='row'>
          <NotesModule onParamChange={handleChangeTrackParam} notes={notes} setCurrentScale={setCurrentScale} />
          <CompositionModule onParamChange={handleChangeTrackParam} params={compositionParams} />
        </div>
      </section>
    </div>
  );
});

export default App;

// find why to do this...?
// const latestTrackParams = useRef(trackParams);
// useEffect(() => {
//   latestTrackParams.current = trackParams;
// }, [trackParams]);

// window.addEventListener('keydown', (e: KeyboardEvent) => {
//   if (e.key === ' ') {
//     togglePlay();
//   }
// });
