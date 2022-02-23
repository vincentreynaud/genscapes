import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as Tone from 'tone';
import { Pattern, PolySynth, Tremolo } from 'tone';
import { Scale } from '@tonaljs/tonal';
import { nanoid } from '@reduxjs/toolkit';
import find from 'lodash/find';
import { RiVolumeDownFill } from '@react-icons/all-files/ri/RiVolumeDownFill.esm';
import { IoMdClose } from '@react-icons/all-files/io/IoMdClose.esm';

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
  getTrackParamsBoundaries,
  mapEffectNameToInitialState,
  mapEffectNameToToneComponent,
  mapEffectNameToUiMinComponent,
} from '../lib/constants';
import '../styles/index.scss';
import PolySynthUiMin from './modules/PolySynthUiMin';
import SliderInput from './shared/SliderInput';
import { toInteger } from 'lodash';
import IconButton from './shared/IconButton';
import TrackSettingsModal from './TrackSettingsModal';

type Props = {
  trackId: number;
};

export default function Track({ trackId }: Props) {
  const dispatch = useAppDispatch();
  const selectEffectsParams = useMemo(() => makeSelectParamModuleByType(trackId, 'effect'), [trackId]);
  const selectSourceParams = useMemo(() => makeSelectParamModuleByType(trackId, 'source'), [trackId]);
  const selectSourceNodes = useMemo(() => makeSelectToneNodesByType(trackId, 'source'), [trackId]) as SelectSourceNodes;
  const selectEffectNodes = useMemo(() => makeSelectToneNodesByType(trackId, 'effect'), [trackId]);
  const selectEffectAudioModules = useMemo(() => makeSelectAudioModuleByType(trackId, 'effect'), [trackId]);
  const selectTrackParams = useMemo(() => makeSelectTrackParams(trackId), [trackId]);
  const selectTrackAudio = useMemo(() => makeSelectTrackAudio(trackId), [trackId]);
  const { global: boundaries } = useMemo(() => getTrackParamsBoundaries(), []);
  const globalParams = useAppSelector(selectGlobalParams);
  const trackParams = useAppSelector(selectTrackParams);
  const globalAudio = useAppSelector(selectGlobalAudio);
  const trackAudio = useAppSelector(selectTrackAudio);
  const [sourceParams] = useAppSelector(selectSourceParams);
  const effectsParams = useAppSelector(selectEffectsParams);
  const [sourceNode] = useAppSelector(selectSourceNodes);
  const effectAudioModules = useAppSelector(selectEffectAudioModules);
  const effectNodes = useAppSelector(selectEffectNodes);
  const { signalChain: signalChainParams, composition: compositionParams } = trackParams;
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

  const [trackVolume, setTrackVolume] = useState(0.5);

  return (
    <>
      <div id={`track-${trackId}`} className='container-fluid'>
        <div className='row'>
          {signalChainParams.map((mod, i) => {
            if (isSourceParamsModule(mod)) {
              return <PolySynthUiMin key={i} mod={mod} onParamChange={handleChangeModuleParam} />;
            } else {
              const Component = mapEffectNameToUiMinComponent()[mod.name];
              return <Component key={i} onParamChange={handleChangeModuleParam} mod={mod} />;
            }
          })}
        </div>
        <div className='top-settings'>
          <div className='container-fluid p-0'>
            <div className='row gx-2 align-items-center'>
              <div className='col-auto me-1'>
                <SliderInput
                  label={<RiVolumeDownFill />}
                  min={boundaries.volume.min}
                  max={boundaries.volume.max}
                  step={boundaries.volume.step}
                  unit={boundaries.volume.unit}
                  value={toInteger(trackVolume)}
                  onChange={setTrackVolume}
                />
              </div>
              <div className='col-auto'>
                <TrackSettingsModal
                  trackId={trackId}
                  setCurrentScale={setCurrentScale}
                  onTrackParamChange={handleChangeTrackParam}
                  onModuleParamChange={handleChangeModuleParam}
                  onAddEffect={handleAddEffect}
                  onDeleteEffect={handleDeleteEffect}
                />
              </div>
              <div className='col-auto'>
                <IconButton>
                  <IoMdClose />
                </IconButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
