import { memo, useCallback, useEffect, useMemo } from 'react';
import * as Tone from 'tone';
import { AutoFilter, Delay, Gain, Pattern, PolySynth, Reverb, Synth, Tremolo } from 'tone';
import { Scale } from '@tonaljs/tonal';
import RangeInput from './RangeInput';
import NotesModule from './NotesModule';
import InstrumentModule from './InstrumentModule';
import CompositionModule from './CompositionModule';
import { updateParam, addEffect, updateEffectOptions, setGlobalParam, setPlay } from '../reducers/params';
import { setGlobalAudioComponent, chainTrackAudioComponent, setTrackCompositionComponent } from '../reducers/audio';
import {
  clearDoubleHashes,
  getCurrentDetune,
  getCurrentInterval,
  getCurrentNoteLength,
  updateUrlQuery,
} from '../helpers';
import { useAppSelector, useAppDispatch } from '../hooks';
import '../styles/index.scss';
import AddButton from './AddButton';
import AutoFilterModule from './AutoFilterModule';
import { EffectName, EffectParams, ModuleId, TrackEffectState } from '../types/params';
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

const mapEffectNameToInitialState: Record<EffectName, TrackEffectState> = {
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
  const selectEffectModules = useMemo(() => makeSelectAudioModuleByType(trackId, 'effect'), [trackId]);
  const selectTrackParams = useMemo(() => makeSelectTrackParams(trackId), [trackId]);
  const selectTrackAudio = useMemo(() => makeSelectTrackAudio(trackId), [trackId]);
  const globalParams = useAppSelector(selectGlobalParams);
  const globalAudio = useAppSelector(selectGlobalAudio);
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
  const effectModules = useAppSelector((state) => selectEffectModules(state));
  const effectNodes = useAppSelector((state) => selectEffectNodes(state));
  const {
    waveform,
    envelope: { attack, decay, release, sustain },
    modulationRate,
    modulationAmount,
    detune,
    randomiseDetune,
  } = sourceParams;

  // init component
  useEffect(() => {
    const outputNode = new Gain(volume).toDestination();
    const synthLfoNode = new Tremolo(modulationRate, modulationAmount).start();
    const sourceNode = new PolySynth({
      voice: Synth,
      maxPolyphony: 8,
      options: {
        volume: -12,
        oscillator: { type: waveform },
        detune: getCurrentDetune(detune, randomiseDetune),
        envelope: { attack, decay, sustain, release },
      },
    });
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

  const handleAddEffect = useCallback(
    (name: EffectName) => {
      if (outputNode) {
        const id = nanoid();
        const effectState = mapEffectNameToInitialState[name];
        const ToneEffect = mapEffectNameToToneComponent[name];
        const toneEffectNode = new ToneEffect();
        toneEffectNode.set(effectState.options);
        sourceNode.disconnect();
        sourceNode.chain(...effectNodes, outputNode);
        // autoFilterNode.set({ frequency: 200, filter: { Q: 1, type: 'lowpass' } });
        dispatch(addEffect(trackId, { id, ...effectState }));
        dispatch(chainTrackAudioComponent(trackId, { name, id, type: 'effect', toneNode: toneEffectNode }));
      } else {
        console.error('store output node is null');
      }
    },
    [dispatch, sourceNode, effectNodes, outputNode]
  );

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

  // Update sourceNode on instrument params change
  useEffect(() => {
    if (sourceNode) {
      sourceNode.set({
        envelope: { attack, decay, sustain, release },
        oscillator: { type: waveform },
      });
    }
  }, [sourceNode, attack, decay, sustain, release, waveform]);

  // Update synthLfoNode on params change
  // useEffect(() => {
  //   if (synthLfoNode) {
  //     synthLfoNode.set({
  //       wet: modulationAmount,
  //       frequency: modulationRate,
  //     });
  //   }
  // }, [synthLfoNode, modulationRate, modulationAmount]);

  function setCurrentScale(note: string, octave: string, scaleType: string) {
    console.log(note);
    const scaleName = `${note}${octave} ${scaleType}`;
    const scale = clearDoubleHashes(Scale.get(scaleName).notes);
    handleChangeParam('notes', 'root', note);
    handleChangeParam('notes', 'octave', octave);
    handleChangeParam('notes', 'scaleType', scaleType);
    handleChangeParam('notes', 'scaleName', scaleName);
    handleChangeParam('notes', 'scale', scale);
    if (composition?.pattern) {
      composition.pattern.set({ values: scale });
    }
  }

  const handleChangeParam = (module, param, value, paramGroup = '') => {
    dispatch(updateParam(trackId, module, param, value, paramGroup));
  };

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

  const handleDeleteEffect = (effectName: string) => {};

  const handleChangeEffectOptions = (effectName: EffectName, effectId: ModuleId, options: EffectParams) => {
    const mod = find(effectModules, (node) => node.id === effectId);
    if (mod) {
      mod.toneNode.set(options);
      dispatch(updateEffectOptions(trackId, effectName, options));
      mod.toneNode.get();
    } else {
      console.error("couldn't find audio module");
    }
  };

  useEffect(() => {
    updateUrlQuery(trackParams);
  }, [trackParams]);

  return (
    <div className='content'>
      <div id='main-controls'>
        <button id='play-button' className='btn btn-dark' onClick={togglePlay}>
          {playing ? 'Stop' : 'Start'}
        </button>
        <div id='volume'>
          <RangeInput
            label=''
            min={0}
            max={1}
            step={0.1}
            unit=''
            initValue={volume}
            onChange={handleChangeGlobalParam}
          />
        </div>
      </div>
      <section className='container-fluid'>
        <div className='row'>
          <InstrumentModule onParamChange={handleChangeParam} params={sourceParams} />
          {effectsParams.map((effect, i) => {
            const Component = mapEffectNameToUiComponent[effect.name];
            return (
              <Component
                name={effect.name}
                id={effect.id}
                params={effect.options}
                onParamChange={handleChangeEffectOptions}
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
          <NotesModule onParamChange={handleChangeParam} notes={notes} setCurrentScale={setCurrentScale} />
          <CompositionModule onParamChange={handleChangeParam} params={compositionParams} />
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
