import React, { Component } from "react";
import ReactDOM from "react-dom";
import WAAClock from "waaclock";

const AudioContext = window.AudioContext || window.webkitAudioContext;

// type State = {
//   steps: number[],
//   currentStep: number,
//   playing: boolean
// }

export default class DrumMachine extends Component {
  constructor(props) {
    super(props);
    this.state = {
      steps: [0, 0, 0, 0],
      currentStep: 0,
      playing: false,
    };
  }

  componentDidMount() {
    this.context = new AudioContext();
    this.clock = new WAAClock(this.context);
    // this.clock.start();
    // this.clock.callbackAtTime(this.handleTick, this.context.currentTime).repeat(0.47);
  }

  handleTick = ({ deadline }) => {
    console.log("handleTick", deadline);
    const { currentStep, steps } = this.state;
    const newCurrentStep = currentStep + 1;

    if (steps[newCurrentStep % steps.length]) {
      trigger(this.context, deadline);
    }

    this.setState({ currentStep: newCurrentStep });
  };

  handlePlayPress = () => {
    if (!this.state.playing) {
      this.setState(
        {
          currentStep: -1,
          playing: true,
        },
        () => {
          this.clock.start();
          console.log(45, this.clock);
          this.tickEvent = this.clock.callbackAtTime(this.handleTick, this.context.currentTime).repeat(0.47);
          console.log(51, this.tickEvent);
        }
      );
    } else {
      this.setState({ playing: false }, () => {
        this.clock.stop();
        this.tickEvent.clear();
        this.tickEvent = null;
      });
    }
  };

  render() {
    const { currentStep, playing, steps } = this.state;

    return (
      <div className="sequencer-wrapper">
        <div className="step-display">{`Current Step: ${currentStep % steps.length}`}</div>
        <button className="play-button" onClick={() => this.handlePlayPress()}>
          {playing ? "Stop" : "Play"}
        </button>
      </div>
    );
  }
}

function trigger(context, deadline) {
  const oscillator = context.createOscillator();
  const amplifier = context.createGain();

  oscillator.frequency.value = 200;
  amplifier.gain.setValueAtTime(0, deadline);

  oscillator.frequency.linearRampToValueAtTime(50, deadline + 0.15);
  amplifier.gain.linearRampToValueAtTime(1, deadline + 0.02);
  amplifier.gain.linearRampToValueAtTime(0, deadline + 0.2);

  oscillator.connect(amplifier);
  amplifier.connect(context.destination);

  oscillator.start(deadline);
  oscillator.stop(deadline + 2);
  setTimeout(() => {
    amplifier.disconnect();
  }, 3000);
}
