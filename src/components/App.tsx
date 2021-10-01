import RangeInput from "./RangeInput";
import "../styles/index.scss";
import { memo, useCallback, useContext, useEffect, useState } from "react";
import { getDelay, getFilter, getGain, getOscillator } from "../lib/audio-helpers";
import { random, range, round } from "lodash";
import { Note, Scale } from "@tonaljs/tonal";
import { pickRandomElement } from "../utils";
import Oscillator from "../lib/Oscillator";
import context from "./AudioCtxContext";
import * as Tone from "tone";
import { Gain, Pattern, PolySynth, Synth } from "tone";
import { NOTE_NAMES, OCTAVES, SCALE_TYPES } from "../lib/constants";
import { calcMax, calcMin } from "../helpers";

type NotesState = {
  root: string;
  scaleType: string;
  scaleName: string;
  scale: string[];
  octave: string;
};

type AppState = {
  currentNoteIndex: number;
  currentNote: string;
  currentFreq: number;
  currentNoteLength: number;
  currentDetune: number;
  nextNoteTime: number;
  delayIsOn: boolean;
};

type State = {
  pattern: Pattern<any> | null;
  masterVolume: Gain | null;
};

const App = memo(() => {
  const [state, setState] = useState<State>({
    pattern: null,
    masterVolume: null,
  });
  const [synth, setSynth] = useState<PolySynth | null>(null);
  const [masterVolume, setMasterVolume] = useState<Gain | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [notes, setNotes] = useState<NotesState>({
    root: "",
    scaleType: "",
    scaleName: "",
    scale: [],
    octave: "",
  });

  const [params, setParams] = useState({
    volume: 0.3,
    randomiseDetune: 0.2,
    detune: 2,
    waveform: "sine", // OscillatorType | undefined
    attack: 0.3,
    sustain: 0.8,
    release: 0.3,
    noteLength: 3,
    randomiseNoteLength: 0,
    spacing: 2,
    randomiseSpacing: 0,
    modulationAmount: 0.2,
    modulationRate: 25,
    delayAmount: 0,
    delayTime: 1,
    delayFeedback: 0,
    reverbAmount: 0.0,
    reverbFilterFreq: 250,
    reverbFilterQ: 0.3,
  });

  const [randoms, setRandoms] = useState({
    minSpacing: calcMin(params.spacing, params.randomiseSpacing),
    maxSpacing: calcMax(params.spacing, params.randomiseSpacing),
    minDetune: calcMin(params.detune, params.randomiseDetune),
    maxDetune: calcMax(params.detune, params.randomiseDetune),
    minNoteLength: calcMin(params.noteLength, params.randomiseNoteLength),
    maxNoteLength: calcMax(params.noteLength, params.randomiseNoteLength),
  });

  const [playState, setPlayState] = useState<AppState>({
    currentNoteIndex: 0,
    currentNote: "",
    currentFreq: 333,
    currentNoteLength: round(random(randoms.minNoteLength, randoms.maxNoteLength, true), 2),
    currentDetune: round(random(randoms.minDetune, randoms.maxDetune, true)),
    nextNoteTime: round(random(randoms.minSpacing, randoms.maxSpacing, true), 2),
    delayIsOn: false,
  });

  useEffect(() => {
    const scaleType = pickRandomElement(SCALE_TYPES);
    const root = pickRandomElement(NOTE_NAMES);
    const octave = pickRandomElement(OCTAVES).toString();
    const scaleName = `${root}${octave} ${scaleType}`;
    const scale = Scale.get(scaleName).notes;
    setNotes({ ...notes, root, octave, scaleType, scaleName, scale });

    let { volume } = params;
    const masterVolume = new Gain(volume).toDestination();
    const synth = new PolySynth().connect(masterVolume);
    setMasterVolume(masterVolume);
    setSynth(synth);
    console.log("init");
  }, []);

  // Change master volume
  useEffect(() => {
    if (masterVolume) {
      masterVolume.set({ gain: params.volume });
    } else {
      console.error("master volume is null");
    }
  }, [masterVolume, params.volume]);

  // Change Pattern
  useEffect(() => {
    const pattern = new Pattern(
      (time, note) => {
        console.log(time, note, synth);
        synth?.triggerAttackRelease(note, playState.currentNoteLength, time);
      },
      notes.scale,
      "random"
    );
    setState({ ...state, pattern });
    console.log("init pattern");
    return () => {
      setState({ ...state, pattern: null });
    };
  }, [synth, playState.currentNoteLength, notes.scale]);

  useEffect(() => {
    const currentNoteLength = round(random(randoms.minNoteLength, randoms.maxNoteLength, true), 2);
    const currentDetune = round(random(randoms.minDetune, randoms.maxDetune, true));
    const currentNote = notes.scale[playState.currentNoteIndex];
    const currentFreq = round(Note.freq(currentNote) as number, 2);
    const nextNoteTime = round(random(randoms.minSpacing, randoms.maxSpacing, true), 2);
    setPlayState({ ...playState, currentNote, currentFreq, currentNoteLength, currentDetune, nextNoteTime });
  }, [
    notes.scale,
    playState.currentNoteIndex,
    randoms.minNoteLength,
    randoms.maxNoteLength,
    randoms.minDetune,
    randoms.maxDetune,
    randoms.minSpacing,
    randoms.maxSpacing,
  ]);

  useEffect(() => {
    const minSpacing = calcMin(params.spacing, params.randomiseSpacing);
    const maxSpacing = calcMax(params.spacing, params.randomiseSpacing);
    setRandoms({ ...randoms, minSpacing, maxSpacing });
  }, [params.spacing, params.randomiseSpacing]);

  useEffect(() => {
    const minDetune = calcMin(params.detune, params.randomiseDetune);
    const maxDetune = calcMax(params.detune, params.randomiseDetune);
    setRandoms({ ...randoms, minDetune, maxDetune });
  }, [params.detune, params.randomiseDetune]);

  useEffect(() => {
    const minNoteLength = calcMin(params.noteLength, params.randomiseNoteLength);
    const maxNoteLength = calcMax(params.noteLength, params.randomiseNoteLength);
    setRandoms({ ...randoms, minNoteLength, maxNoteLength });
  }, [params.noteLength, params.randomiseNoteLength]);

  function setCurrentScale(note: string, octave: string, scaleType: string) {
    const scaleName = `${note}${octave} ${scaleType}`;
    const scale = Scale.get(scaleName).notes;
    setNotes({ ...notes, root: note, octave, scaleType, scaleName, scale });
  }

  function togglePlay() {
    if (!isPlaying) {
      setIsPlaying(true);
      Tone.Transport.start();
      state.pattern?.start();
    } else {
      setIsPlaying(false);
      state.pattern?.stop();
      Tone.Transport.pause();
    }
  }

  const onParamChange = (param: keyof typeof params) => (value: number) => {
    setParams({ ...params, [param]: value });
  };

  return (
    <div className="content">
      <div id="main-controls">
        <button id="play-button" className="btn btn-dark" onClick={togglePlay}>
          {isPlaying ? "Stop" : "Start"}
        </button>
        <div id="volume">
          <RangeInput
            label=""
            min={0}
            max={1}
            step={0.1}
            unit=""
            initValue={params.volume}
            onChange={onParamChange("volume")}
          />
        </div>
      </div>
      <section className="container-fluid">
        <div className="row">
          <div className="box col-auto" id="notes-options">
            <h4>Notes</h4>
            <select
              name="root"
              id="root-select"
              value={notes.root}
              onChange={(e) => setCurrentScale(e.currentTarget.value, notes.octave, notes.scaleType)}
            >
              {NOTE_NAMES.map((note, i) => (
                <option value={note} key={i}>
                  {note}
                </option>
              ))}
            </select>
            <select
              name="octave"
              id="octave-select"
              value={notes.octave}
              onChange={(e) => setCurrentScale(notes.root, e.currentTarget.value, notes.scaleType)}
            >
              {OCTAVES.map((octave) => (
                <option value={octave.toString()} key={octave}>
                  {octave}
                </option>
              ))}
            </select>
            <select
              name="scaleType"
              id="scale-type-select"
              value={notes.scaleType}
              onChange={(e) => setCurrentScale(notes.root, notes.octave, e.currentTarget.value)}
            >
              {SCALE_TYPES.map((scale, i) => (
                <option value={scale} key={i}>
                  {scale}
                </option>
              ))}
            </select>
            <div className="my-2" id="notes-display">
              {notes.scale && notes.scale.join(" ")}
            </div>
            <RangeInput
              label="Detune"
              min={-50}
              max={50}
              step={1}
              unit="ct"
              initValue={params.detune}
              onChange={onParamChange("detune")}
            />
            <RangeInput
              label="Randomise"
              min={0}
              max={1}
              step={0.01}
              unit="%"
              initValue={params.randomiseDetune}
              onChange={onParamChange("randomiseDetune")}
            />
          </div>
          <div className="box col-auto" id="oscillator-options">
            <h4>Oscillator</h4>
            <select name="waveform" id="waveform-select">
              <option value="sine" id="sine-wave">
                Sine Wave
              </option>
              <option value="triangle" id="triangle-wave">
                Triangle Wave
              </option>
              <option value="square" id="square-wave">
                Square Wave
              </option>
              <option value="sawtooth" id="sawtooth-wave">
                Sawtooth Wave
              </option>
            </select>
          </div>
          <div className="box col-auto" id="envelope-options">
            <h4>Envelope</h4>
            <RangeInput
              label="Attack Time"
              min={0}
              max={0.5}
              step={0.01}
              unit="ms?"
              initValue={params.attack}
              onChange={onParamChange("attack")}
            />
            <RangeInput
              label="Sustain Amount"
              min={0}
              max={1}
              step={0.01}
              unit="%"
              initValue={params.sustain}
              onChange={onParamChange("sustain")}
            />
            <RangeInput
              label="Release Time"
              min={0}
              max={0.5}
              step={0.01}
              unit="%"
              initValue={params.release}
              onChange={onParamChange("release")}
            />
          </div>
          <div className="box col-auto" id="modulation-options">
            <h4>Modulation</h4>
            <RangeInput
              label="Amount"
              min={0}
              max={1}
              step={0.01}
              unit="%"
              initValue={params.modulationAmount}
              onChange={onParamChange("modulationAmount")}
            />
            <RangeInput
              label="Amount"
              min={0}
              max={30}
              step={0.01}
              unit="Hz"
              initValue={params.modulationRate}
              onChange={onParamChange("modulationRate")}
            />
          </div>
          <div className="box col-auto" id="delay-options">
            <h4>Delay</h4>
            {/* <button id="delay-toggle">Off</button> */}
            <RangeInput
              label="Amount"
              min={0}
              max={1}
              step={0.01}
              unit="%"
              initValue={params.delayAmount}
              onChange={onParamChange("delayAmount")}
            />
            <RangeInput
              label="Delay Time"
              min={0}
              max={2}
              step={0.01}
              unit="s"
              initValue={params.delayTime}
              onChange={onParamChange("delayTime")}
            />
            <RangeInput
              label="Delay Feedback"
              min={0}
              max={1}
              step={0.01}
              unit="%"
              initValue={params.delayFeedback}
              onChange={onParamChange("delayFeedback")}
            />
          </div>
          <div className="box col-auto" id="reverb-options">
            <h4>Reverb</h4>
            {/* <button id="reverb-toggle">Off</button> */}
            <RangeInput
              label="Amount"
              min={0}
              max={1}
              step={0.01}
              unit="%"
              initValue={params.reverbAmount}
              onChange={onParamChange("reverbAmount")}
            />
            <RangeInput
              label="Filter Frequency"
              min={26}
              max={1800}
              step={0.1}
              unit="Hz"
              initValue={params.reverbFilterFreq}
              onChange={onParamChange("reverbFilterFreq")}
            />
            <RangeInput
              label="Filter Q"
              min={0.1}
              max={18}
              step={0.01}
              unit=""
              initValue={params.reverbFilterQ}
              onChange={onParamChange("reverbFilterQ")}
            />
          </div>
        </div>
      </section>
      <section className="container-fluid">
        <div className="row">
          <div className="box col-auto" id="composition-options">
            <h4>Composition</h4>
            <div className="container-fluid px-0">
              <div className="row no-gutters">
                <div className="col-6">
                  <RangeInput
                    label="Note length"
                    min={0.2}
                    max={48}
                    step={0.1}
                    unit="s"
                    initValue={params.noteLength}
                    onChange={onParamChange("noteLength")}
                  />
                </div>
                <div className="col-6">
                  <RangeInput
                    label="Randomise"
                    min={0}
                    max={1}
                    step={0.01}
                    unit="%"
                    initValue={params.randomiseNoteLength}
                    onChange={onParamChange("randomiseNoteLength")}
                  />
                </div>
              </div>
            </div>
            <div className="container-fluid px-0">
              <div className="row no-gutters">
                <div className="col-6">
                  <RangeInput
                    label="Spacing"
                    min={0}
                    max={48}
                    step={0.1}
                    unit="s"
                    initValue={params.spacing}
                    onChange={onParamChange("spacing")}
                  />
                </div>
                <div className="col-6">
                  <RangeInput
                    label="Randomise"
                    min={0}
                    max={1}
                    step={0.01}
                    unit="%"
                    initValue={params.randomiseSpacing}
                    onChange={onParamChange("randomiseSpacing")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

export default App;
