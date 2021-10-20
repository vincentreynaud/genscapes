import { memo, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Gain, Pattern, PolySynth } from 'tone';
import { Scale } from '@tonaljs/tonal';
import RangeInput from './RangeInput';
import NotesModule from './NotesModule';
import InstrumentModule from './InstrumentModule';
import CompositionModule from './CompositionModule';
import { updateParam } from '../reducers/tracks';
import { setGlobalParam, setPlay } from '../reducers/global';
import { setGlobalAudioComponent, setTrackAudioComponent, setTrackCompositionComponent } from '../reducers/audio';
import { calcRandom } from '../helpers';
import { useAppSelector, useAppDispatch } from '../hooks';
import '../styles/index.scss';

const App = memo(() => {
	const trackId = 0;

	const dispatch = useAppDispatch();
	const trackParams = useAppSelector((state) => state.tracks[trackId]);
	const trackAudio = useAppSelector((state) => state.audio.tracks[trackId]);
	const globalParams = useAppSelector((state) => state.global);
	const globalAudio = useAppSelector((state) => state.audio.global);
	const { instrument, notes, composition: compositionParams, effects } = trackParams;
	const { playing, volume } = globalParams;

	const latestTrackParams = useRef(trackParams);
	useEffect(() => {
		latestTrackParams.current = trackParams;
	}, [trackParams]);

	const { masterVolumeNode } = globalAudio;
	const { synthNode, composition } = trackAudio;

	// const toCalcOnTheSpot = {
	// 	currentNoteLength: calcRandom(composition.noteLength, composition.randomiseNoteLength),
	// 	currentDetune: calcRandom(notes.detune, notes.randomiseDetune),
	// 	nextNoteTime: calcRandom(composition.interval, composition.randomiseInterval),
	// });

	useEffect(() => {
		const masterVolumeNode = new Gain(volume).toDestination();
		const synthNode = new PolySynth().connect(masterVolumeNode);
		dispatch(setGlobalAudioComponent('masterVolumeNode', masterVolumeNode));
		dispatch(setTrackAudioComponent(trackId, 'synthNode', synthNode));
		console.log('init');
	}, []);

	const handleParamChange = (module, param, value) => {
		dispatch(updateParam(module, param, value));
	};

	const handleCompositionChange = (key, value: Pattern<string> | null) => {
		if (playing) {
			stopComposition();
		}
		dispatch(setTrackCompositionComponent(trackId, key, value));
	};

	const handleGlobalParamChange = (value: number) => {
		dispatch(setGlobalParam('volume', value));
	};

	// Continue playing pattern on change
	useEffect(() => {
		if (playing) {
			startComposition();
		}
	}, [composition?.pattern]);

	// Change master volume
	useEffect(() => {
		if (masterVolumeNode) {
			masterVolumeNode.set({ gain: volume });
		} else {
			console.error('master volume is null');
		}
	}, [masterVolumeNode, volume]);

	// Change Pattern
	useEffect(() => {
		const pattern = new Pattern(
			(time, note) => {
				console.log(time, note, synthNode);
				synthNode?.triggerAttackRelease(note, compositionParams.noteLength, time); // try with currentNoteLength calc on the spot
			},
			notes.scale,
			'random'
		);
		handleCompositionChange('pattern', pattern);
		console.log('init pattern');
		return () => {
			handleCompositionChange('pattern', null);
		};
	}, [synthNode, compositionParams.noteLength, notes.scale]);

	// Update current note length
	useEffect(() => {
		const { noteLength, randomiseNoteLength } = compositionParams;
		const currentNoteLength = calcRandom(noteLength, randomiseNoteLength);
		// setPlayState({ ...latestPlayState.current, currentNoteLength });
	}, [compositionParams.noteLength, compositionParams.randomiseNoteLength]);

	// Update current detune
	useEffect(() => {
		const { detune, randomiseDetune } = notes;
		const currentDetune = calcRandom(detune, randomiseDetune);
		// setPlayState({ ...playState, currentDetune }); // ERR: state will be overwritten by previous
	}, [notes.detune, notes.randomiseDetune]);

	// Update next note time
	useEffect(() => {
		const { interval, randomiseInterval } = compositionParams;
		const nextNoteTime = calcRandom(interval, randomiseInterval);
		// setPlayState({ ...playState, nextNoteTime }); // ERR: state will be overwritten by previous
	}, [compositionParams.interval, compositionParams.randomiseInterval]);

	function setCurrentScale(note: string, octave: string, scaleType: string) {
		const scaleName = `${note}${octave} ${scaleType}`;
		const scale = Scale.get(scaleName).notes;
		handleParamChange('notes', 'root', note);
		handleParamChange('notes', 'octave', octave);
		handleParamChange('notes', 'scaleType', scaleType);
		handleParamChange('notes', 'scaleName', scaleName);
		handleParamChange('notes', 'scale', scale);
	}

	function startComposition() {
		Tone.Transport.start();
		if (composition && composition.pattern) {
			composition.pattern.start();
		} else {
			console.log(composition, composition?.pattern);
		}
	}

	function stopComposition() {
		if (composition && composition.pattern) {
			composition.pattern.stop();
		} else {
			console.log(composition, composition?.pattern);
		}
		Tone.Transport.pause();
	}

	function togglePlay() {
		if (!playing) {
			dispatch(setPlay(true));
			startComposition();
		} else {
			dispatch(setPlay(false));
			stopComposition();
		}
	}

	return (
		<div className="content">
			<div id="main-controls">
				<button id="play-button" className="btn btn-dark" onClick={togglePlay}>
					{playing ? 'Stop' : 'Start'}
				</button>
				<div id="volume">
					<RangeInput
						label=""
						min={0}
						max={1}
						step={0.1}
						unit=""
						initValue={volume}
						onChange={handleGlobalParamChange}
					/>
				</div>
			</div>
			<section className="container-fluid">
				<div className="row">
					<InstrumentModule onParamChange={handleParamChange} params={instrument} />
				</div>
			</section>
			<section className="container-fluid">
				<div className="row">
					<NotesModule onParamChange={handleParamChange} notes={notes} setCurrentScale={setCurrentScale} />
					<CompositionModule onParamChange={handleParamChange} params={compositionParams} />
				</div>
			</section>
		</div>
	);
});

export default App;
