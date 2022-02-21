import React, { useCallback, useEffect, useMemo } from 'react';
import * as Tone from 'tone';
import { Pattern, PolySynth, Tremolo } from 'tone';
import { Scale } from '@tonaljs/tonal';
import { nanoid } from '@reduxjs/toolkit';
import find from 'lodash/find';

import SliderInput from './shared/SliderInput';
import TrackSettings from './TrackSettings';
import { useAppSelector, useAppDispatch, useWhatChanged } from '../hooks';
import { updateModuleParam as updateModuleParam, addEffect, updateTrackParam } from '../reducers/params';
import { chainTrackAudioComponent, setTrackCompositionComponent } from '../reducers/audio';
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
import {
  clearDoubleHashes,
  getCurrentDetune,
  getCurrentInterval,
  getCurrentNoteLength,
  isSourceParamsModule,
} from '../helpers';
import { EffectName, TrackState, UpdateModuleParamHelper, UpdateTrackParamHelper } from '../types/params';
import {
  mapEffectNameToInitialState,
  mapEffectNameToToneComponent,
  MODULES_DISPLAY_NAMES_MAP,
  PARAMS_BOUNDARIES_MAP,
} from '../lib/constants';
import '../styles/index.scss';

type Props = {
  trackId: number;
};

const { polySynth } = PARAMS_BOUNDARIES_MAP;

export default function Track({ trackId }: Props) {
  const dispatch = useAppDispatch();
  const selectEffectsParams = useMemo(() => makeSelectParamModuleByType(trackId, 'effect'), [trackId]);
  const selectSourceParams = useMemo(() => makeSelectParamModuleByType(trackId, 'source'), [trackId]);
  const selectSourceNodes = useMemo(() => makeSelectToneNodesByType(trackId, 'source'), [trackId]) as SelectSourceNodes;
  const selectEffectNodes = useMemo(() => makeSelectToneNodesByType(trackId, 'effect'), [trackId]);
  const selectEffectAudioModules = useMemo(() => makeSelectAudioModuleByType(trackId, 'effect'), [trackId]);
  const selectTrackParams = useMemo(() => makeSelectTrackParams(trackId), [trackId]);
  const selectTrackAudio = useMemo(() => makeSelectTrackAudio(trackId), [trackId]);
  const globalParams = useAppSelector(selectGlobalParams);
  const trackParams = useAppSelector((state) => selectTrackParams(state));
  const globalAudio = useAppSelector((state) => selectGlobalAudio(state));
  const trackAudio = useAppSelector((state) => selectTrackAudio(state));
  const [sourceParams] = useAppSelector((state) => selectSourceParams(state));
  const effectsParams = useAppSelector((state) => selectEffectsParams(state));
  const [sourceNode] = useAppSelector((state) => selectSourceNodes(state));
  const effectAudioModules = useAppSelector((state) => selectEffectAudioModules(state));
  const effectNodes = useAppSelector((state) => selectEffectNodes(state));
  const { composition: compositionParams } = trackParams;
  const { notes } = compositionParams;
  const { scale } = notes;
  const { signalChain, composition } = trackAudio;
  const { playing } = globalParams;
  const { outputNode } = globalAudio;
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
  const [changedParamsMod]: TrackState['signalChain'] = useWhatChanged([sourceParams, ...effectsParams]);

  // init component
  useEffect(() => {
    const synthLfoNode = new Tremolo(modulationRate, modulationAmount).start();
    const sourceNode = new PolySynth(sourceParams.options);
    if (outputNode) {
      chainPolySynth(sourceNode, synthLfoNode);
    } else {
      console.error(`outputNode is ${outputNode}`);
    }
  }, [outputNode]);

  function chainPolySynth(source, lfo) {
    source.chain(lfo, outputNode);

    const synthModule = {
      name: 'polySynth',
      type: 'source',
      id: sourceParams.id,
      toneNode: source,
    };
    const lfoModule = { name: 'tremolo', type: 'effect', id: sourceParams.id, toneNode: lfo };

    // TODO: RESET SIGNAL CHAIN ON NEW SOURCE SET UP
    dispatch(chainTrackAudioComponent(trackId, synthModule));
    dispatch(chainTrackAudioComponent(trackId, lfoModule));
    console.log('initialised polySynth');
  }

  const handleChangeTrackParam: UpdateTrackParamHelper = (path, value) => {
    dispatch(updateTrackParam({ trackId, path, value }));
  };

  // useCallback will be necessary when the tracks change
  const handleChangeModuleParam: UpdateModuleParamHelper = (modId, path, value) => {
    dispatch(updateModuleParam({ trackId, modId, path, value }));
  };

  const onModuleParamChange = (path: string) => (v: number) => {
    handleChangeModuleParam(signalChain[0].id!, path, v);
  };

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

  // Toggle composition playback
  useEffect(() => {
    if (playing) {
      startComposition();
    } else {
      stopComposition();
      sourceNode?.releaseAll();
    }
  }, [playing, startComposition, stopComposition, sourceNode]);

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

  const handleChangeComposition = (key: 'pattern', value: Pattern<string> | null) => {
    if (playing) {
      stopComposition();
      value?.dispose(); // is that right?
    }
    dispatch(setTrackCompositionComponent(trackId, key, value));
  };

  function setCurrentScale(note: string, octave: string, scaleType: string) {
    const scaleName = `${note}${octave} ${scaleType}`;
    const scale = clearDoubleHashes(Scale.get(scaleName).notes);
    handleChangeTrackParam('notes.root', note);
    handleChangeTrackParam('notes.octave', octave);
    handleChangeTrackParam('notes.scaleType', scaleType);
    handleChangeTrackParam('notes.scaleName', scaleName);
    handleChangeTrackParam('notes.scale', scale);
    if (composition?.pattern) {
      composition.pattern.set({ values: scale });
    }
  }

  const handleAddEffect = useCallback(
    (name: EffectName) => {
      if (!name) return;
      if (outputNode) {
        const id = nanoid();
        const effectState = mapEffectNameToInitialState()[name];
        const ToneEffect = mapEffectNameToToneComponent()[name];
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
    <>
      <div id={`track-${trackId}`} className='container-fluid'>
        <div className='row'>
          {signalChain.map((mod, i) => {
            if (mod.type === 'source') {
              return (
                <div className='col' key={i}>
                  <h4>{MODULES_DISPLAY_NAMES_MAP[mod.name]}</h4>
                  <div className='container-fluid p-0'>
                    <div className='row'>
                      <div className='col-auto'>
                        <SliderInput
                          label='A'
                          min={polySynth.attack.min}
                          max={polySynth.attack.max}
                          step={polySynth.attack.step}
                          unit={polySynth.attack.unit}
                          value={attack}
                          onChange={onModuleParamChange('options.options.envelope.attack')}
                          className='mb-2'
                        />
                        <SliderInput
                          label='D'
                          min={polySynth.decay.min}
                          max={polySynth.decay.max}
                          step={polySynth.decay.step}
                          unit={polySynth.decay.unit}
                          value={decay}
                          onChange={onModuleParamChange('options.options.envelope.decay')}
                          className='mb-2'
                        />
                      </div>
                      <div className='col-auto'>
                        <SliderInput
                          label='S'
                          min={polySynth.sustain.min}
                          max={polySynth.sustain.max}
                          step={polySynth.sustain.step}
                          unit={polySynth.sustain.unit}
                          value={sustain}
                          onChange={onModuleParamChange('options.options.envelope.sustain')}
                          className='mb-2'
                        />
                        <SliderInput
                          label='R'
                          min={polySynth.release.min}
                          max={polySynth.release.max}
                          step={polySynth.release.step}
                          unit={polySynth.release.unit}
                          value={release}
                          onChange={onModuleParamChange('options.options.envelope.release')}
                          className='mb-2'
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>
      <TrackSettings
        trackId={trackId}
        setCurrentScale={setCurrentScale}
        onTrackParamChange={handleChangeTrackParam}
        onModuleParamChange={handleChangeModuleParam}
        onAddEffect={handleAddEffect}
        onDeleteEffect={handleDeleteEffect}
      />
    </>
  );
}
