import { Scale } from "@tonaljs/tonal";
import { filter, range } from "lodash";
import { playDrone, setup } from "../scripts";
import "../styles/index.css";
import { getNotesFromMidi, pickRandomElement } from "../utils";

const NOTES = getNotesFromMidi(range(20, 35));
const NOTE = pickRandomElement(NOTES);
const SCALE_NAMES_ALL = Scale.names();
const SCALE_NAMES_MINOR = filter(SCALE_NAMES_ALL, (name) => name.includes("minor"));
const SCALE_NAME = `${NOTE} ${pickRandomElement(SCALE_NAMES_MINOR)}`;
const SCALE_NOTES = Scale.get(SCALE_NAME).notes;
console.log(SCALE_NAME);

function App() {
  const context = setup();

  playDrone(context, {
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
  });

  return (
    <div className="app">
      <header className="app-header">
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a className="app-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
