import { createContext } from "react";
const AudioContext = window.AudioContext || (window as any).webkitAudioContext;

if (!AudioContext) alert("your browser doesn't support the Web Audio API");

let audioCtx: AudioContext | null = null;

const AudioCtxContext = createContext({
  getAudioContext: () => audioCtx,
  requestInit: () => {
    if (audioCtx === null) {
      audioCtx = new AudioContext();
    }
  },
});

export default AudioCtxContext;
