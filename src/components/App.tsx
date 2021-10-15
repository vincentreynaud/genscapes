import RangeInput from './RangeInput';
import '../styles/index.scss';
import { memo, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getDelay, getFilter, getGain, getOscillator } from '../lib/audio-helpers';
import { random, range, round } from 'lodash';
import { Note, Scale } from '@tonaljs/tonal';
import { pickRandomElement } from '../utils';
import Oscillator from '../lib/Oscillator';
import context from './AudioCtxContext';
import * as Tone from 'tone';
import { Gain, Pattern, PolySynth, Synth } from 'tone';
import { NOTE_NAMES, OCTAVES, SCALE_TYPES } from '../lib/constants';
import { calcMax, calcMin, calcRandom } from '../helpers';
import { useDispatch } from 'react-redux';
import { setAudioComponent, updateParam } from '../reducers/tracks';
import { Instrument } from 'tone/build/esm/instrument/Instrument';
import InstrumentModule from './InstrumentModule';
import CompositionModule from './CompositionModule';
import { useAppSelector, useAppDispatch } from '../hooks';
import NotesModule from './NotesModule';
import { setGlobalComponent, setPlay } from '../reducers/global';

type NotesState = {
	root: string;
	scaleType: string;
	scaleName: string;
	scale: string[];
	octave: string;
};

type AppState = {
	currentNoteLength: number;
	currentDetune: number;
	nextNoteTime: number;
};

type State = {
	pattern: Pattern<any> | null;
	masterVolume: Gain | null;
};

const App = memo(() => {
	const trackId = 0;

	const dispatch = useAppDispatch();
	const trackState = useAppSelector((state) => state.tracks[trackId]);
	const globalState = useAppSelector((state) => state.global);
	const { instrument, notes, composition, effects, audio: trackAudio } = trackState;
	const synth = trackAudio.components.synth;
	const { playing, volume, components: globalComponents } = globalState;
	const masterVolume = globalComponents.masterVolume;

	const latestTrackState = useRef(trackState);
	useEffect(() => {
		latestTrackState.current = trackState;
	}, [trackState]);

	// const toCalcOnTheSpot = {
	// 	currentNoteLength: calcRandom(composition.noteLength, composition.randomiseNoteLength),
	// 	currentDetune: calcRandom(notes.detune, notes.randomiseDetune),
	// 	nextNoteTime: calcRandom(composition.interval, composition.randomiseInterval),
	// });

	const handleParamChange = (module, param, value) => {
		dispatch(updateParam(module, param, value));
	};

	useEffect(() => {
		const scaleType = pickRandomElement(SCALE_TYPES);
		const root = pickRandomElement(NOTE_NAMES);
		const octave = pickRandomElement(OCTAVES).toString();
		const scaleName = `${root}${octave} ${scaleType}`;
		const scale = Scale.get(scaleName).notes;
		handleParamChange('notes', 'root', root);
		handleParamChange('notes', 'octave', octave);
		handleParamChange('notes', 'scaleType', scaleType);
		handleParamChange('notes', 'scaleName', scaleName);
		handleParamChange('notes', 'scale', scale);

		const masterVolume = new Gain(volume).toDestination();
		const synth = new PolySynth().connect(masterVolume);
		dispatch(setGlobalComponent('masterVolume', masterVolume));
		dispatch(setAudioComponent('synth', synth));
		console.log('init');
	}, []);

	// Change master volume
	useEffect(() => {
		if (masterVolume) {
			masterVolume.set({ gain: volume });
		} else {
			console.error('master volume is null');
		}
	}, [masterVolume, volume]);

	// Change Pattern
	useEffect(() => {
		const pattern = new Pattern(
			(time, note) => {
				console.log(time, note, synth);
				synth?.triggerAttackRelease(note, composition.noteLength, time); // try with currentNoteLength calc on the spot
			},
			notes.scale,
			'random'
		);
		handleParamChange('composition', 'pattern', pattern);
		console.log('init pattern');
		return () => {
			handleParamChange('composition', 'pattern', null);
		};
	}, [synth, composition.noteLength, notes.scale]);

	// Update current note length
	useEffect(() => {
		const { noteLength, randomiseNoteLength } = composition;
		const currentNoteLength = calcRandom(noteLength, randomiseNoteLength);
		// setPlayState({ ...latestPlayState.current, currentNoteLength });
	}, [composition.noteLength, composition.randomiseNoteLength]);

	// Update current detune
	useEffect(() => {
		const { detune, randomiseDetune } = notes;
		const currentDetune = calcRandom(detune, randomiseDetune);
		// setPlayState({ ...playState, currentDetune }); // ERR: state will be overwritten by previous
	}, [notes.detune, notes.randomiseDetune]);

	// Update next note time
	useEffect(() => {
		const { interval, randomiseInterval } = composition;
		const nextNoteTime = calcRandom(interval, randomiseInterval);
		// setPlayState({ ...playState, nextNoteTime }); // ERR: state will be overwritten by previous
	}, [composition.interval, composition.randomiseInterval]);

	function setCurrentScale(note: string, octave: string, scaleType: string) {
		const scaleName = `${note}${octave} ${scaleType}`;
		const scale = Scale.get(scaleName).notes;
		handleParamChange('notes', 'root', note);
		handleParamChange('notes', 'octave', octave);
		handleParamChange('notes', 'scaleType', scaleType);
		handleParamChange('notes', 'scaleName', scaleName);
		handleParamChange('notes', 'scale', scale);
	}

	function togglePlay() {
		if (!playing) {
			dispatch(setPlay(true));
			Tone.Transport.start();
			composition.pattern?.start();
		} else {
			dispatch(setPlay(false));
			composition.pattern?.stop();
			Tone.Transport.pause();
		}
	}

	return (
		<div className="content">
			<div id="main-controls">
				<button id="play-button" className="btn btn-dark" onClick={togglePlay}>
					{playing ? 'Stop' : 'Start'}
				</button>
				{/* <div id="volume">
					<RangeInput
						label=""
						min={0}
						max={1}
						step={0.1}
						unit=""
						initValue={params.volume}
						onChange={onParamChange('volume')}
					/>
				</div> */}
			</div>
			<section className="container-fluid">
				<div className="row">
					<InstrumentModule onParamChange={handleParamChange} params={instrument} />
				</div>
			</section>
			<section className="container-fluid">
				<div className="row">
					<NotesModule onParamChange={handleParamChange} notes={notes} setCurrentScale={setCurrentScale} />
					<CompositionModule onParamChange={handleParamChange} params={composition} />
				</div>
			</section>
		</div>
	);
});

export default App;
