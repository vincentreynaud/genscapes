import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as Tone from 'tone';
import { Pattern, PolySynth, Tremolo } from 'tone';
import { Scale } from '@tonaljs/tonal';
import { nanoid } from '@reduxjs/toolkit';
import find from 'lodash/find';
import { RiVolumeDownFill } from 'react-icons/ri';
import { IoMdClose } from 'react-icons/io';

import { useAppSelector, useAppDispatch, useWhatChanged } from '../hooks';
import { updateModuleParam as updateModuleParam, addEffect, updateTrackParam, deleteTrack } from '../reducers/params';
import {
  chainTrackAudioComponent,
  deleteTrack as deleteTrackAudio,
  setTrackCompositionComponent,
} from '../reducers/audio';
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
  getTrackParamsBoundaries,
  mapEffectNameToInitialState,
  mapEffectNameToToneComponent,
  mapEffectNameToUiMinComponent,
} from '../lib/constants';
import PolySynthUiMin from './modules/PolySynthUiMin';
import CompositionUiMin from './modules/CompositionUiMin';
import TrackSettingsModal from './TrackSettingsModal';
import IconButton from './shared/IconButton';
import { clearDoubleHashes, isSourceParamsModule } from '../helpers';
import { setPattern } from '../helpers/tone';
import { EffectName, TrackState, UpdateModuleParamHelper, UpdateTrackParamHelper } from '../types/params';
import '../styles/index.scss';

type Props = {
  trackId: number;
  color: string;
};

export default function Track({ trackId, color }: Props) {
  const dispatch = useAppDispatch();
  const selectEffectsParams = useMemo(() => makeSelectParamModuleByType(trackId, 'effect'), [trackId]);
  const selectSourceParams = useMemo(() => makeSelectParamModuleByType(trackId, 'source'), [trackId]);
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
  const [changedParamsMod]: TrackState['signalChain'] = useWhatChanged([sourceParams, ...effectsParams]);
  const effectAudioModules = useAppSelector(selectEffectAudioModules);
  const { signalChain: signalChainParams, sequ: sequParams } = trackParams;
  const { notes } = sequParams;
  const { scale } = notes;
  const { sequ } = trackAudio;
  const { playing } = globalParams;
  const { outputNode } = globalAudio;
  const {
    options: {
      options: { detune },
    },
    tremoloOptions: { rate: modulationRate, amount: modulationAmount },
    rand: { detune: randDetune },
  } = sourceParams as any; // just to make it shut up for now
  const [currentNoteTime, setCurrentNoteTime] = useState(0);

  const chainPolySynth = useCallback(
    (source, lfo) => {
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
    },
    [outputNode, sourceParams.id, trackId, dispatch]
  );

  // init component
  useEffect(() => {
    const synthLfoNode = new Tremolo(modulationRate, modulationAmount).start();
    const sourceNode = new PolySynth(sourceParams.options);
    if (outputNode) {
      chainPolySynth(sourceNode, synthLfoNode);
    } else {
      console.error(`outputNode is ${outputNode}`);
    }
  }, [outputNode, chainPolySynth]);

  const selectSourceNodes = useMemo(() => makeSelectToneNodesByType(trackId, 'source'), [trackId]) as SelectSourceNodes;
  const selectEffectNodes = useMemo(() => makeSelectToneNodesByType(trackId, 'effect'), [trackId]);
  const [sourceNode] = useAppSelector(selectSourceNodes);
  const effectNodes = useAppSelector(selectEffectNodes);

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
      if (effectMod !== undefined) {
        console.log('updating effect node', changedParamsMod);
        effectMod.toneNode.set(changedParamsMod.options || {});
      }
    }
  }, [sourceParams, effectsParams, sourceNode, effectAudioModules]);

  const startComposer = useCallback(() => {
    Tone.Transport.start();
    if (sequ?.pattern) {
      console.log(sequ.pattern.state);
      sequ.pattern.start();
    } else {
      console.log('pattern not set!');
    }
  }, [sequ?.pattern]);

  const stopComposer = useCallback(() => {
    if (sequ?.pattern) {
      sequ.pattern.stop();
    } else {
      console.log('pattern not set!');
    }
    Tone.Transport.pause();
  }, [sequ?.pattern]);

  // Toggle sequ playback
  useEffect(() => {
    if (playing) {
      startComposer();
    } else {
      stopComposer();
      sourceNode?.releaseAll();
    }
  }, [playing, startComposer, stopComposer, sourceNode]);

  // Update pattern
  useEffect(() => {
    const pattern = setPattern(sourceNode, sequParams);
    handleChangeComposition('pattern', pattern);
    return () => {
      handleChangeComposition('pattern', null);
    };
  }, [sourceNode, sequParams]);

  // Continue playing pattern on change
  useEffect(() => {
    if (playing) {
      startComposer();
    }
  }, [sequ?.pattern]);

  const handleChangeComposition = (key: 'pattern', value: Pattern<string> | null) => {
    if (playing) {
      stopComposer();
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
    if (sequ?.pattern) {
      sequ.pattern.set({ values: scale });
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

  // todo!
  function handleDeleteEffect(effectName: string) {}

  function handleDeleteTrack(id: number) {
    dispatch(deleteTrackAudio(id));
    dispatch(deleteTrack(id));
  }

  const [trackVolume, setTrackVolume] = useState(0.5);

  return (
    <>
      <div id={`track-${trackId}`} className={`container-fluid ${color}`}>
        <div className='row'>
          {signalChainParams.map((mod, i) => {
            if (isSourceParamsModule(mod)) {
              return <PolySynthUiMin key={i} mod={mod} onParamChange={handleChangeModuleParam} />;
            } else {
              const Component = mapEffectNameToUiMinComponent()[mod.name];
              return <Component key={i} onParamChange={handleChangeModuleParam} mod={mod} />;
            }
          })}
          <CompositionUiMin
            params={sequParams}
            onParamChange={handleChangeTrackParam}
            setCurrentScale={setCurrentScale}
          />
        </div>
        <div className='top-settings'>
          <div className='container-fluid p-0'>
            <div className='row gx-2 align-items-center'>
              <div className='col-auto me-1'>
                {/* Hidden until functionality is built */}
                {/* <SliderInput
                  label={<RiVolumeDownFill />}
                  min={boundaries.volume.min}
                  max={boundaries.volume.max}
                  step={boundaries.volume.step}
                  unit={boundaries.volume.unit}
                  value={toInteger(trackVolume)}
                  onChange={setTrackVolume}
                /> */}
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
                <IconButton onClick={() => handleDeleteTrack(trackId)}>
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
