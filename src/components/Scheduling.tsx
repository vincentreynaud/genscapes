import "../styles/index.scss";
import { useEffect, useState } from "react";
import { getFreq } from "../lib/audio-helpers";
import Oscillator from "../lib/Oscillator";
import WAAClock from "waaclock";
import * as Tone from "tone";
import { AMOscillator, Clock, Context } from "tone";

const AudioContext = window.AudioContext || (window as any).webkitAudioContext;

type ScheduledNote = {
  note: number;
  time: number;
};

type PlayState = {
  lookahead: number;
  scheduleAheadTime: number;
  currentNote: number;
  nextNoteTime: number;
  queue: Array<ScheduledNote>;
  scale: string[];
  notes: {};
  tempo: number;
  signature: number;
  noteDur: number; // 60 / tempo
  barDur: number; // signature * noteDur
  isPlaying: boolean;
};

function Scheduling() {
  const [ctx, setCtx] = useState<Context | null>(null);
  const [clock, setClock] = useState<Clock | null>(null);
  const [playState, setPlayState] = useState<PlayState>({
    lookahead: 25.0,
    scheduleAheadTime: 0.1,
    currentNote: 0,
    nextNoteTime: 0.0,
    queue: [],
    scale: ["Eb3", "F3", "G3", "Bb3", "C4"],
    notes: {},
    tempo: 120,
    signature: 4,
    noteDur: 60 / 120, // 60 / tempo
    barDur: 4 * (60 / 120), // signature * noteDur
    isPlaying: false,
  });

  useEffect(() => {
    const ctx = new Context();
    setCtx(ctx);
    console.log("init");
  }, []);

  const synth = new Tone.Synth().toDestination();
  const pattern = new Tone.Pattern(
    (time, note) => {
      // the order of the notes passed in depends on the pattern
      synth.triggerAttackRelease(note, 2, time);
    },
    ["C3", "D4", "E4", "A4"],
    "random"
  );

  const bla = Tone.Midi(1500, "hz");
  console.log(bla);

  // const loop = new Tone.Loop((time) => {
  //   synth.triggerAttackRelease("D3", 0.1, time);
  //   console.log(time);
  // }, 2).start(0);

  function togglePlay() {
    if (!playState.isPlaying) {
      // seq.start(ctx?.currentTime || 0);
      // loop.start(ctx?.currentTime || 0);
      pattern.start(ctx?.currentTime || 0);
      Tone.Transport.start();
    } else {
      Tone.Transport.stop(ctx?.currentTime || 0);
    }
    setPlayState({ ...playState, isPlaying: !playState.isPlaying });
  }

  return (
    <div className="content">
      <div id="main-controls">
        <button id="play-button" className="btn btn-dark" onClick={togglePlay}>
          {playState.isPlaying ? "Stop" : "Start"}
        </button>
      </div>
    </div>
  );
}

export default Scheduling;
