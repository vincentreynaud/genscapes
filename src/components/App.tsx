import { memo, useCallback, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Gain, Pattern, PolySynth, Synth } from 'tone';
import { Scale } from '@tonaljs/tonal';
import RangeInput from './RangeInput';
import NotesModule from './NotesModule';
import InstrumentModule from './InstrumentModule';
import CompositionModule from './CompositionModule';
import { updateParam } from '../reducers/tracks';
import { setGlobalParam, setPlay } from '../reducers/global';
import {
  setGlobalAudioComponent,
  setTrackAudioComponent,
  setTrackCompositionComponent,
} from '../reducers/audio';
import {
  getCurrentDetune,
  getCurrentInterval,
  getCurrentNoteLength,
} from '../helpers';
import { useAppSelector, useAppDispatch } from '../hooks';
import '../styles/index.scss';

const App = memo(() => {
  const trackId = 0;

  const dispatch = useAppDispatch();
  const trackParams = useAppSelector((state) => state.tracks[trackId]);
  const trackAudio = useAppSelector((state) => state.audio.tracks[trackId]);
  const globalParams = useAppSelector((state) => state.global);
  const globalAudio = useAppSelector((state) => state.audio.global);
  const {
    instrument,
    notes,
    composition: compositionParams,
    effects,
  } = trackParams;
  const { playing, volume } = globalParams;

  // find why to do this...?
  const latestTrackParams = useRef(trackParams);
  useEffect(() => {
    latestTrackParams.current = trackParams;
  }, [trackParams]);

  const { masterVolumeNode } = globalAudio;
  const { synthNode, composition } = trackAudio;
  const {
    waveform,
    envelope: { attack, decay, release, sustain },
  } = instrument;

  // init component
  useEffect(() => {
    const masterVolumeNode = new Gain(volume).toDestination();
    const synthNode = new PolySynth({
      voice: Synth,
      maxPolyphony: 4,
      options: {
        oscillator: { type: waveform },
        envelope: { attack, decay, sustain, release },
      },
    }).connect(masterVolumeNode);
    dispatch(setGlobalAudioComponent('masterVolumeNode', masterVolumeNode));
    dispatch(setTrackAudioComponent(trackId, 'synthNode', synthNode));
    console.log('init');
  }, []);

  const togglePlay = () => {
    if (!playing) {
      dispatch(setPlay(true));
      startComposition();
    } else {
      dispatch(setPlay(false));
      stopComposition();
      // synthNode?.releaseAll();
    }
  };

  const startComposition = () => {
    Tone.Transport.start();
    if (composition?.pattern) {
      composition.pattern.start();
    } else {
      console.log('pattern not set!');
    }
  };

  const stopComposition = () => {
    if (composition?.pattern) {
      composition.pattern.stop();
    } else {
      console.log('pattern not set!');
    }
    Tone.Transport.pause();
  };

  const handleParamChange = (module, param, value, paramGroup = '') => {
    dispatch(updateParam(module, param, value, paramGroup));
  };

  const handleGlobalParamChange = (value: number) => {
    dispatch(setGlobalParam('volume', value));
  };

  const handleCompositionChange = (key, value: Pattern<string> | null) => {
    if (playing) {
      stopComposition();
      value?.dispose(); // is that right?
    }
    dispatch(setTrackCompositionComponent(trackId, key, value));
  };

  // Change master volume
  useEffect(() => {
    if (masterVolumeNode) {
      masterVolumeNode.set({ gain: volume });
    } else {
      console.error('master volume is null');
    }
  }, [masterVolumeNode, volume]);

  const triggerPatternNote = useCallback(
    (time, note) => {
      const noteLength = getCurrentNoteLength(compositionParams);
      const interval = getCurrentInterval(compositionParams);
      const detune = getCurrentDetune(notes);
      console.log(note, 'interval', interval, 'noteLength', noteLength);
      console.log('detune', detune);
      synthNode?.set({ detune });
      synthNode?.triggerAttackRelease(note, noteLength, time + interval);
    },
    [synthNode, compositionParams, notes]
  );

  // Update Pattern
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

  // update synthNode on instrument params change
  useEffect(() => {
    if (synthNode) {
      synthNode.set({
        envelope: { attack, decay, sustain, release },
        oscillator: { type: waveform },
      });
    }
  }, [synthNode, attack, decay, sustain, release, waveform]);

  // Continue playing pattern on change
  useEffect(() => {
    if (playing) {
      startComposition();
    }
  }, [composition?.pattern]);

  function setCurrentScale(note: string, octave: string, scaleType: string) {
    console.log(note);
    const scaleName = `${note}${octave} ${scaleType}`;
    const scale = Scale.get(scaleName).notes;
    handleParamChange('notes', 'root', note);
    handleParamChange('notes', 'octave', octave);
    handleParamChange('notes', 'scaleType', scaleType);
    handleParamChange('notes', 'scaleName', scaleName);
    handleParamChange('notes', 'scale', scale);
    if (composition?.pattern) {
      composition.pattern.set({ values: scale });
    }
  }

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
          <InstrumentModule
            onParamChange={handleParamChange}
            params={instrument}
          />
        </div>
      </section>
      <section className='container-fluid'>
        <div className='row'>
          <NotesModule
            onParamChange={handleParamChange}
            notes={notes}
            setCurrentScale={setCurrentScale}
          />
          <CompositionModule
            onParamChange={handleParamChange}
            params={compositionParams}
          />
        </div>
      </section>
    </div>
  );
});

export default App;
