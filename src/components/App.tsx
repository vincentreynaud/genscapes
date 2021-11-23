import { memo, useCallback, useEffect, useMemo } from 'react';
import * as Tone from 'tone';
import { AutoFilter, Delay, Gain, Pattern, PolySynth, Reverb, Synth, Tremolo } from 'tone';
import { Scale } from '@tonaljs/tonal';
import RangeInput from './RangeInput';
import NotesModule from './NotesModule';
import InstrumentModule from './InstrumentModule';
import CompositionModule from './CompositionModule';
import { updateParam, addEffect, updateEffectOptions, setGlobalParam, setPlay } from '../reducers/params';
import { setGlobalAudioComponent, setTrackAudioComponent, setTrackCompositionComponent } from '../reducers/audio';
import { clearDoubleHashes, getCurrentDetune, getCurrentInterval, getCurrentNoteLength } from '../helpers';
import { useAppSelector, useAppDispatch } from '../hooks';
import '../styles/index.scss';
import AddButton from './AddButton';
import AutoFilterModule from './AutoFilterModule';
import { EffectName, EffectParams, TrackEffectState } from '../types/params';
import { initialAutoFilterState, initialDelayState, initialReverbState } from '../initialState';
import { ToneAudioEffect } from '../types/audio';
import {
  makeSelectParamComponentByType,
  makeSelectTrackAudio,
  makeSelectTrackParams,
  selectGlobalAudio,
  selectGlobalParams,
} from '../selectors';

type EffectUiComponent = typeof AutoFilterModule;

const mapEffectNameToUiComponent: Record<EffectName, EffectUiComponent> = {
  'auto-filter': AutoFilterModule,
  reverb: AutoFilterModule,
  delay: AutoFilterModule,
};

const mapEffectNameToToneComponent: Record<EffectName, ToneAudioEffect> = {
  'auto-filter': AutoFilter,
  reverb: Reverb,
  delay: Delay,
};

const mapEffectNameToInitialState: Record<EffectName, TrackEffectState> = {
  'auto-filter': initialAutoFilterState,
  reverb: initialReverbState,
  delay: initialDelayState,
};

const App = memo(() => {
  const trackId = 0;
  const dispatch = useAppDispatch();
  const selectEffects = useMemo(() => makeSelectParamComponentByType(trackId, 'effect'), [trackId]);
  const selectInstrument = useMemo(() => makeSelectParamComponentByType(trackId, 'instrument'), [trackId]);
  const selectTrackParams = useMemo(() => makeSelectTrackParams(trackId), [trackId]);
  const selectTrackAudio = useMemo(() => makeSelectTrackAudio(trackId), [trackId]);
  const globalParams = useAppSelector(selectGlobalParams);
  const globalAudio = useAppSelector(selectGlobalAudio);
  const trackParams = useAppSelector((state) => selectTrackParams(state));
  const trackAudio = useAppSelector((state) => selectTrackAudio(state));
  const { playing, volume } = globalParams;
  const { outputNode } = globalAudio;
  const { signalChain, notes, composition: compositionParams } = trackParams;
  const { scale } = notes;
  const { synthNode, synthLfoNode, composition } = trackAudio;
  const effects = useAppSelector((state) => selectEffects(state));
  const [instrument] = useAppSelector((state) => selectInstrument(state));
  console.log('reselect effects', effects);
  const {
    waveform,
    envelope: { attack, decay, release, sustain },
    modulationRate,
    modulationAmount,
    detune,
    randomiseDetune,
  } = instrument;

  // init component
  useEffect(() => {
    const outputNode = new Gain(volume).toDestination();
    const synthLfoNode = new Tremolo(modulationRate, modulationAmount).start();
    const synthNode = new PolySynth({
      voice: Synth,
      maxPolyphony: 8,
      options: {
        volume: -12,
        oscillator: { type: waveform },
        detune: getCurrentDetune(detune, randomiseDetune),
        envelope: { attack, decay, sustain, release },
      },
    });
    synthNode.chain(synthLfoNode, outputNode);
    console.log(outputNode);

    dispatch(setGlobalAudioComponent('outputNode', outputNode));
    dispatch(setTrackAudioComponent(trackId, 'synthNode', synthNode));
    dispatch(setTrackAudioComponent(trackId, 'synthLfoNode', synthLfoNode));
    console.log('init');

    // window.addEventListener('keydown', (e: KeyboardEvent) => {
    //   if (e.key === ' ') {
    //     togglePlay();
    //   }
    // });

    return () => {
      // synthNode.dispose();
      // outputNode.dispose();
    };
  }, []);

  const handleAddEffect = (effectName: EffectName) => {
    const effectState = mapEffectNameToInitialState[effectName];
    const ToneEffect = mapEffectNameToToneComponent[effectName];
    const effectNode = new ToneEffect();
    effectNode.set(effectState.options);
    // autoFilterNode.set({ frequency: 200, filter: { Q: 1, type: 'lowpass' } });
    dispatch(addEffect(trackId, effectState));
  };

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
      // @ts-ignore
      synthNode?.releaseAll();
    }
  }, [playing, startComposition, stopComposition, synthNode]);

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
      synthNode?.set({ detune: currentDetune });
      synthNode?.triggerAttackRelease(note, noteLength, time + interval);
    },
    [synthNode, compositionParams, detune, randomiseDetune]
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

  // Update synthNode on instrument params change
  useEffect(() => {
    if (synthNode) {
      synthNode.set({
        envelope: { attack, decay, sustain, release },
        oscillator: { type: waveform },
      });
    }
  }, [synthNode, attack, decay, sustain, release, waveform]);

  // Update synthLfoNode on params change
  useEffect(() => {
    if (synthLfoNode) {
      synthLfoNode.set({
        wet: modulationAmount,
        frequency: modulationRate,
      });
    }
  }, [synthLfoNode, modulationRate, modulationAmount]);

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

  const handleChangeEffectOptions = (effectName: EffectName, options: EffectParams) => {
    dispatch(updateEffectOptions(trackId, effectName, options));
  };

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
          <InstrumentModule onParamChange={handleChangeParam} params={instrument} />
          {effects.map((effect, i) => {
            const Component = mapEffectNameToUiComponent[effect.name];
            return (
              <Component
                name={effect.name}
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

// find why to do this...?
// const latestTrackParams = useRef(trackParams);
// useEffect(() => {
//   latestTrackParams.current = trackParams;
// }, [trackParams]);

export default App;
