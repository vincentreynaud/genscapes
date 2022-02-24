import React, { Component } from "react";
import waaclock from "waaclock";

class Player extends Component {
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
    this.clock = new waaclock(this.context);
  }

  handleTick({ deadline }) {
    const { currentStep, steps } = this.state;
    const newCurrentStep = currentStep + 1;

    if (steps[newCurrentStep % steps.length]) {
      console.log("tick");
    }

    setTimeout(() => {
      this.setState({ currentStep: newCurrentStep });
    }, deadline - this.context.currentTime);
  }

  handlePlayPress() {
    if (!this.state.playing) {
      this.setState(
        {
          currentStep: -1,
          playing: true,
        },
        () => {
          this.clock.start();
          this.tickEvent = this.clock.callbackAtTime(this.handleTick.bind(this), this.context.currentTime).repeat(0.47);
        }
      );
    } else {
      this.setState({ playing: false }, () => {
        this.clock.stop();
        this.tickEvent = null;
      });
    }
  }

  render() {
    const { currentStep, playing, steps } = this.state;
    return (
      <div>
        {`Current Step: ${currentStep % steps.length}`}
        <button onClick={() => this.handlePlayPress()}>{playing ? "Stop" : "Play"}</button>
      </div>
    );
  }
}

export default Player;
