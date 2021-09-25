import { createContext } from "react";
const AudioContext = window.AudioContext || (window as any).webkitAudioContext;

const ctx = new AudioContext();
const context = createContext({ ctx });

export default context;
