import { Scale } from "@tonaljs/tonal";
import { random } from "lodash";
import { DroneParams, playDrone, setup } from "../lib/setup-and-play";
import "../styles/index.css";
import { moveOctave } from "../utils";

const SCALE_NAME = `F1 minor six pentatonic`;
const SCALE_NOTES = Scale.get(SCALE_NAME).notes;

const drone1Params: DroneParams = {
  notes: SCALE_NOTES,
  minLength: 1,
  maxLength: 15,
  droneType: "sawtooth",
  droneNextMin: 0,
  droneNextMax: 20,
  droneDetuneMin: 36.0,
  droneDetuneMax: 40.0,
  filterType: "lowpass",
  filterQMin: 1,
  filterQMax: 4,
  filterFreqBase: 0.0,
  filterFreqRampMin: 250,
  filterFreqRampMax: 750,
  filterFreqRampTimeMin: 4,
  filterFreqRampTimeMax: 7,
};

const drone2Params: DroneParams = {
  notes: moveOctave(SCALE_NOTES, 2),
  minLength: 1,
  maxLength: 6,
  droneType: "sine",
  droneNextMin: 25,
  droneNextMax: 48,
  droneDetuneMin: 16.0,
  droneDetuneMax: 20.0,
  filterType: "bandpass",
  filterQMin: 0,
  filterQMax: 1,
  filterFreqBase: 80,
  filterFreqRampMin: 100,
  filterFreqRampMax: 300,
  filterFreqRampTimeMin: 0,
  filterFreqRampTimeMax: 3,
};

export default function play() {
  const context1 = setup();
  const context2 = setup();
  playDrone(context1, drone1Params);
  setTimeout(() => {
    playDrone(context2, drone2Params);
  }, random(10, 15, true) * 1000);
}
