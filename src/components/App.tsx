import { memo, useCallback, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { AutoFilter, Gain, Pattern, PolySynth, Synth, Tremolo } from 'tone';
import { Scale } from '@tonaljs/tonal';
import RangeInput from './RangeInput';
import NotesModule from './NotesModule';
import InstrumentModule from './InstrumentModule';
import CompositionModule from './CompositionModule';
import { updateParam, addEffect, updateEffectOptions } from '../reducers/tracks';
import { setGlobalParam, setPlay } from '../reducers/global';
import { setGlobalAudioComponent, setTrackAudioComponent, setTrackCompositionComponent } from '../reducers/audio';
import { clearDoubleHashes, getCurrentDetune, getCurrentInterval, getCurrentNoteLength } from '../helpers';
import { useAppSelector, useAppDispatch } from '../hooks';
import '../styles/index.scss';
import AddButton from './AddButton';
import AutoFilterModule from './AutoFilterModule';
import { EffectId, EffectParams } from '../types/tracks';

const App = memo(() => {
  const trackId = 0;

  const dispatch = useAppDispatch();
  const trackParams = useAppSelector((state) => state.tracks[trackId]);
  const trackAudio = useAppSelector((state) => state.audio.tracks[trackId]);
  const globalParams = useAppSelector((state) => state.global);
  const globalAudio = useAppSelector((state) => state.audio.global);
  const { instrument, notes, composition: compositionParams, effects } = trackParams;
  const { playing, volume } = globalParams;

  // find why to do this...?
  const latestTrackParams = useRef(trackParams);
  useEffect(() => {
    latestTrackParams.current = trackParams;
  }, [trackParams]);

  const { outputNode } = globalAudio;
  const { synthNode, synthLfoNode, composition } = trackAudio;
  const {
    waveform,
    envelope: { attack, decay, release, sustain },
    modulationRate,
    modulationAmount,
  } = instrument;

  // init component
  useEffect(() => {
    const outputNode = new Gain(volume).toDestination();
    const autoFilterNode = new AutoFilter(800).connect(outputNode);
    const synthLfoNode = new Tremolo(modulationRate, modulationAmount).connect(autoFilterNode).start();
    const synthNode = new PolySynth({
      voice: Synth,
      maxPolyphony: 8,
      options: {
        volume: -12,
        oscillator: { type: waveform },
        detune: getCurrentDetune(notes),
        envelope: { attack, decay, sustain, release },
      },
    }).connect(synthLfoNode);
    autoFilterNode.set({ frequency: 200, filter: { Q: 1, type: 'lowpass' } });

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

  const handleParamChange = (module, param, value, paramGroup = '') => {
    dispatch(updateParam(trackId, module, param, value, paramGroup));
  };

  const handleAddEffect = (effect: any) => {
    dispatch(addEffect(trackId, effect));
  };

  const handleGlobalParamChange = (value: number) => {
    dispatch(setGlobalParam('volume', value));
  };

  const handleCompositionChange = (key: 'pattern', value: Pattern<string> | null) => {
    if (playing) {
      stopComposition();
      value?.dispose(); // is that right?
    }
    dispatch(setTrackCompositionComponent(trackId, key, value));
  };

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
      const detune = getCurrentDetune(notes);
      console.log(note, detune, 'interval', interval, 'noteLength', noteLength);
      synthNode?.set({ detune });
      synthNode?.triggerAttackRelease(note, noteLength, time + interval);
    },
    [synthNode, compositionParams, notes]
  );

  // Update pattern
  useEffect(() => {
    console.log('init pattern');
    const pattern = new Pattern({
      callback: triggerPatternNote,
      interval: getCurrentInterval(compositionParams),
      values: notes.scale,
      pattern: 'random',
    });
    handleCompositionChange('pattern', pattern);
    return () => {
      handleCompositionChange('pattern', null);
    };
  }, [compositionParams, notes.scale, triggerPatternNote]);

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
    handleParamChange('notes', 'root', note);
    handleParamChange('notes', 'octave', octave);
    handleParamChange('notes', 'scaleType', scaleType);
    handleParamChange('notes', 'scaleName', scaleName);
    handleParamChange('notes', 'scale', scale);
    if (composition?.pattern) {
      composition.pattern.set({ values: scale });
    }
  }

  const MapEffectIdToComponent = {
    'auto-filter': AutoFilterModule,
  };

  const handleChangeEffectOptions = (effectId: EffectId, options: EffectParams) => {
    dispatch(updateEffectOptions(trackId, effectId, options));
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
            onChange={handleGlobalParamChange}
          />
        </div>
      </div>
      <section className='container-fluid'>
        <div className='row'>
          <InstrumentModule onParamChange={handleParamChange} params={instrument} />
          {trackParams.effects.map((effect) => {
            const Component = MapEffectIdToComponent[effect.id];
            return <Component id={effect.id} params={effect.options} onParamChange={handleChangeEffectOptions} />;
          })}
          <AddButton onAdd={handleAddEffect} />
        </div>
      </section>
      <section className='container-fluid'>
        <div className='row'>
          <NotesModule onParamChange={handleParamChange} notes={notes} setCurrentScale={setCurrentScale} />
          <CompositionModule onParamChange={handleParamChange} params={compositionParams} />
        </div>
      </section>
    </div>
  );
});

export default App;
