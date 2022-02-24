export type OscillatorOptions = {
  type: OscillatorType;
  detune: number;
  attack: number;
  sustain: number;
  release: number;
  noteLength: number;
};

class Oscillator {
  ctx: AudioContext;
  oscillator?: OscillatorNode;
  output?: GainNode;
  amplitude: number;
  params: OscillatorOptions;

  constructor(ctx: AudioContext, options: Partial<OscillatorOptions> = {}) {
    this.ctx = ctx;
    this.amplitude = 0.8;
    this.params = {
      type: "sine",
      detune: 0,
      attack: 0.3,
      sustain: 0.8,
      release: 0.3,
      noteLength: 1,
      ...options,
    };
    this.init();
  }

  private init() {
    this.oscillator = this.ctx.createOscillator();
    this.output = this.ctx.createGain();
    this.output.gain.value = this.amplitude;
  }

  play(freq: number = 333, time: number = 0) {
    if (this.oscillator && this.output) {
      console.log("play", this.params);
      this.oscillator.frequency.value = freq;
      this.oscillator.type = this.params.type;
      console.log(this.oscillator.frequency.value);
      this.output.gain.cancelScheduledValues(time);
      this.output.gain.setValueAtTime(0, time);
      this.output.gain.linearRampToValueAtTime(this.amplitude, time + this.params.attack);
      this.output.gain.linearRampToValueAtTime(0, time + this.params.noteLength - this.params.release);
      this.oscillator.connect(this.output!);
      this.oscillator.start(time);
      this.stop(time + this.params.noteLength);
    }
  }

  stop(when: number | undefined) {
    this.oscillator?.stop(when);
  }

  updateEnvelope({ sustain, attack, release, noteLength }) {
    // const endTime = this.ctx.currentTime + noteLength;
    this.params = {
      ...this.params,
      attack,
      sustain,
      release,
      noteLength,
    };
  }

  connect(input: AudioNode | AudioParam | any) {
    try {
      this.output?.connect(input);
    } catch (e) {
      console.error(e);
    }
    return this;
  }
}

export default Oscillator;
