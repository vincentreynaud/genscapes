import "../styles/index.scss";
import { useEffect, useState } from "react";
import { getFreq } from "../lib/audio-helpers";
import Oscillator from "../lib/Oscillator";
import WAAClock from "waaclock";

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

function Sequencer() {
  const [ctx, setCtx] = useState<AudioContext | null>(null);
  const [clock, setClock] = useState<any>(null);
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

  let timerID: any = null;

  const [uiState, setUiState] = useState({
    noteCount: -1,
    uiEvent: null,
  });

  useEffect(() => {
    const ctx = new AudioContext();
    const clock = new WAAClock();
    clock.start();
    // console.log(clock);
    setCtx(ctx);
    console.log("init");
  }, []);

  const { tempo, currentNote, nextNoteTime, scheduleAheadTime, isPlaying } = playState;

  useEffect(() => {
    if (playState.isPlaying && ctx) {
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      setPlayState({ ...playState, currentNote: 0, nextNoteTime: ctx.currentTime });
      scheduler(playState);
    } else {
      window.clearTimeout(timerID);
    }
    console.log("init");
  }, [isPlaying, tempo, currentNote, nextNoteTime, scheduleAheadTime]);

  function nextNote({ tempo, nextNoteTime, currentNote }) {
    const secondsPerBeat = 60.0 / tempo;
    setPlayState({
      ...playState,
      nextNoteTime: nextNoteTime + secondsPerBeat,
      currentNote: currentNote === 4 ? 0 : currentNote++,
    });
  }

  // issue: https://stackoverflow.com/questions/52584693/making-a-simple-sequencer-using-waaclock-and-react
  function scheduleNote(beatNum: number, time: number) {
    if (ctx) {
      playState.queue.push({ note: beatNum, time });
      const osc = new Oscillator(ctx, { noteLength: 2 });
      osc.connect(ctx.destination);
      let freq = 220.0;

      if (beatNum % 4 === 0) {
        freq = 440.0;
      }

      osc.play(freq, time);
    } else {
      console.error("Context not initialised");
    }
  }

  function scheduler({ tempo, currentNote, nextNoteTime, scheduleAheadTime }) {
    if (ctx) {
      while (nextNoteTime < ctx.currentTime + scheduleAheadTime) {
        scheduleNote(currentNote, nextNoteTime);
        nextNote({ tempo, currentNote, nextNoteTime });
      }

      timerID = window.setTimeout(scheduler, lookahead);
    } else {
      console.error("Context not initialised");
    }
  }

  function togglePlay() {
    setPlayState({ ...playState, isPlaying: !playState.isPlaying });
  }

  function uiNextNote() {
    const nextNoteCount = (uiState.noteCount + 1) % playState.signature;
    // $("#pattern td").removeClass("active");
    // $("#pattern td:nth-child(" + (nextNoteCount + 1) + ")").addClass("active");
  }

  function startWebAudio() {
    const ctx = new AudioContext();
    const clock = new WAAClock(ctx);
    clock.start();
    const uiEvent = clock
      .callbackAtTime(uiNextNote, nextNoteTimeOLD(0))
      .repeat(playState.noteDur)
      .tolerance({ late: 100 });
    setCtx(ctx);
    setClock(clock);
    setUiState({ ...uiState, uiEvent });
  }

  function nextNoteTimeOLD(noteInd: number) {
    const { noteDur, barDur } = playState;
    const currentTime = ctx?.currentTime || 0;
    const currentBar = Math.floor(currentTime / barDur);
    const currentNote = Math.round(currentTime % barDur);
    if (currentNote < noteInd) {
      return currentBar * barDur + noteInd * noteDur;
    } else {
      return (currentBar + 1) * barDur + noteInd * noteDur;
    }
  }

  function play(note: string, noteInd: number) {
    if (ctx !== null) {
      const osc = new Oscillator(ctx);
      osc.connect(ctx.destination);
      const event = clock.callBackAtTime((e) => {
        osc.play(getFreq(note), e.deadline);
      }, nextNoteTimeOLD(noteInd));
      event.repeat(barDur);
      event.tolerance({ late: 0.01 });
      setPlayState({
        ...playState,
        notes: {
          ...playState.notes,
          [note]: {
            ...playState.notes[note],
            [noteInd]: event,
          },
        },
      });
    } else {
      console.error("ctx hasn't been initialised");
    }
  }

  function stop(note, noteInd) {
    const event = playState.notes[note][noteInd];
    event.clear();
  }

  function handleClick() {
    const { signature } = playState;
    for (let noteInd = 0; noteInd < signature; noteInd++) {}
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

export default Sequencer;
