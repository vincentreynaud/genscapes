import play from "../lib/collective-anxiety-drone";
import RangeInput from "./RangeInput";
import "../styles/index.scss";
import { useEffect, useState } from "react";
import { getDelay, getFilter, getGain, getOscillator } from "../lib/audio-helpers";
import { random, range, round } from "lodash";
import { Note, Scale } from "@tonaljs/tonal";
import { pickRandomElement } from "../utils";

const AudioContext = window.AudioContext || (window as any).webkitAudioContext;

function App() {
  const [ctx, setCtx] = useState<AudioContext>(new AudioContext());
  const [nodes, setNodes] = useState<Record<string, AudioNode | null>>({
    masterVolume: null,
    delayNode: null,
    reverbGain: null,
  });
  const [isPlaying, setIsPlaying] = useState(true);
  const [appState, setAppState] = useState({
    currentNoteIndex: 0,
    delayIsOn: false,
  });

  const [notes, setNotes] = useState<Record<string, any>>({
    default: Note.names(["C", "C#", "Dd", "D", "Eb", "E", "F", "F#", "Gb", "G", "Ab", "A", "Bb", "B"]),
    scales: Scale.names(),
    octaves: range(1, 8),
    root: null,
    scaleType: null,
    scaleName: null,
    scale: null,
    octave: null,
  });

  const [params, setParams] = useState({
    volume: 0.3,
    randomiseDetune: 0.2,
    detune: 2,
    waveform: "sine", // OscillatorType | undefined
    attack: 0.3,
    sustain: 0.8,
    release: 0.3,
    noteLength: 2,
    randomiseNoteLength: 0.6,
    spacing: 5,
    randomiseSpacing: 0.5,
    modulationAmount: 0.2,
    modulationRate: 25,
    delayAmount: 0,
    delayTime: 1,
    delayFeedback: 0,
    reverbAmount: 0.0,
    reverbFilterFreq: 250,
    reverbFilterQ: 0.3,
  });

  let {
    volume,
    randomiseDetune,
    detune,
    waveform, // OscillatorType | undefined
    attack,
    sustain,
    release,
    noteLength,
    randomiseNoteLength,
    spacing,
    randomiseSpacing,
    modulationAmount,
    modulationRate,
    delayAmount,
    delayTime,
    delayFeedback,
    reverbAmount,
    reverbFilterFreq,
    reverbFilterQ,
  } = params;

  useEffect(() => {
    const masterVolume = getGain(ctx, volume);
    masterVolume.connect(ctx.destination);

    const delayNode = getDelay(ctx, { delayTime });
    const feedbackNode = getGain(ctx, delayFeedback);
    const delayGainNode = getGain(ctx, delayAmount);

    delayGainNode.connect(delayNode);
    delayNode.connect(feedbackNode).connect(delayNode);

    const reverbDelayA = getDelay(ctx, { delayTime: 0.52 }); // 0.82
    const reverbDelayB = getDelay(ctx, { delayTime: 0.33 }); // 0.73
    const reverbGain = getGain(ctx, reverbAmount);
    const reverbFilter = getFilter(ctx, { type: "bandpass", Q: reverbFilterQ, frequency: reverbFilterFreq });

    reverbGain.connect(reverbDelayA).connect(reverbFilter);
    reverbGain.connect(reverbDelayB).connect(reverbFilter);
    reverbFilter.connect(reverbGain).connect(masterVolume);

    setNodes({
      masterVolume,
      delayNode,
      reverbGain,
    });

    console.log("init");
  }, []);

  useEffect(() => {
    const scaleType = pickRandomElement(notes.scales);
    const root = pickRandomElement(notes.default);
    const octave = pickRandomElement(notes.octaves);
    const scaleName = `${root}${octave} ${scaleType}`;
    setNotes({ ...notes, root });
    setNotes({ ...notes, octave });
    setNotes({ ...notes, scaleType });
    setNotes({ ...notes, scaleName });
    setNotes({ ...notes, scale: Scale.get(scaleName).notes });
    console.log("init notes", root, octave, scaleName);
  }, []);

  let minNoteLength = calcMin(noteLength, randomiseNoteLength);
  let maxNoteLength = calcMax(noteLength, randomiseNoteLength);
  let minSpacing = calcMin(spacing, randomiseSpacing);
  let maxSpacing = calcMax(spacing, randomiseSpacing);
  let minDetune = calcMin(detune, randomiseDetune);
  let maxDetune = calcMax(detune, randomiseDetune);

  function setCurrentScale(note: string, octave: string, scaleType: string) {
    const scaleName = `${note}${octave} ${scaleType}`;
    const scale = Scale.get(scaleName).notes;
    setNotes({ ...notes, root: note, octave, scaleType, scaleName, scale });
  }

  function playCurrentNote() {
    const osc = getOscillator(ctx, { type: waveform } as any);
    const noteGain = getGain(ctx, 0);
    const currentNoteLength = round(random(minNoteLength, maxNoteLength, true), 2);
    const currentDetune = round(random(minDetune, maxDetune, true));
    const endTime = ctx.currentTime + currentNoteLength;
    console.log(`Note length: [ ${minNoteLength} - ${maxNoteLength} ]: ${currentNoteLength}s`);
    noteGain.gain.setValueAtTime(0, 0);
    noteGain.gain.linearRampToValueAtTime(sustain, endTime * attack);
    noteGain.gain.setValueAtTime(sustain, endTime - currentNoteLength * release);
    noteGain.gain.linearRampToValueAtTime(0, endTime - 0.2); // avoid clipping

    const lfoGain = getGain(ctx, modulationAmount);
    lfoGain.connect(osc.frequency);

    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(modulationRate, 0);
    lfo.start(0);
    lfo.stop(ctx.currentTime + noteLength);
    lfo.connect(lfoGain);

    const currentNote = notes.scale[appState.currentNoteIndex];
    osc.frequency.setValueAtTime(Note.freq(currentNote) as number, 0);
    osc.detune.setValueAtTime(currentDetune, 0);
    console.log("Note:", currentNote, round(osc.frequency.value, 2), "detune", round(osc.detune.value, 2));
    osc.start(0);
    osc.stop(endTime);
    osc.connect(noteGain);

    const { masterVolume, delayNode, reverbGain } = nodes;

    // console.log(masterVolume, delayNode, reverbGain);
    if (masterVolume !== null) noteGain.connect(masterVolume);
    if (delayNode !== null) noteGain.connect(delayNode);
    if (reverbGain !== null) noteGain.connect(reverbGain);
  }

  function togglePlay() {
    if (!isPlaying) {
      setIsPlaying(true);
      setTimeout(() => noteLoop(), 1000);
    } else {
      setIsPlaying(false);
    }
  }

  function nextNote() {
    setAppState({ ...appState, currentNoteIndex: random(0, notes.scale.length - 1) });
  }

  function noteLoop() {
    const nextNoteTime = round(random(minSpacing, maxSpacing, true), 2);
    console.log(`Next note: [ ${minSpacing} - ${maxSpacing} ]: ${nextNoteTime}s`);
    if (isPlaying) {
      playCurrentNote();
      nextNote();
      window.setTimeout(() => {
        noteLoop();
      }, nextNoteTime * 1000);
    }
  }

  function calcMin(value: number, randomisation: number): number {
    return round(value - randomisation * value, 2);
  }
  function calcMax(value: number, randomisation: number): number {
    return round(value + randomisation * value, 2);
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
              {notes.default.map((note, i) => (
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
              {notes.octaves.map((octave) => (
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
              {notes.scales.map((scale, i) => (
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
}

export default App;
