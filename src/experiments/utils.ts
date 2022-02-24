import { Key, Note } from '@tonaljs/tonal';
import { random, toInteger } from 'lodash';

type ScaleStyles = 'natural' | 'harmonic' | 'melodic';

export function moveOctave(ScaleNotes: string[], amount: number) {
  return ScaleNotes.map((full) => {
    const note = full.split(/\d$/)[0];
    const octave = full.split(/\D+/)[1];
    const newOctave = (toInteger(octave) + amount).toString();
    return `${note}${newOctave}`;
  });
}

export function getNotesFromMidi(midiNotes: number[]) {
  return midiNotes.map((midi) => Note.fromMidi(midi));
}

export function getMinorScale(note: string, style: ScaleStyles = 'melodic') {
  return Key.minorKey(note)[style].scale;
}

export function mergeParams(params: AudioParam[]) {
  const singleParam: any = params[0];
  const parameter: any = {};
  const audioNodeMethods = Object.getOwnPropertyNames(AudioParam.prototype).filter(
    (prop: any) => typeof singleParam[prop] === 'function'
  );

  //allows things like parameter.setValueAtTime(x, ctx.currentTime)
  audioNodeMethods.forEach((method) => {
    parameter[method] = (...argz: any[]) => {
      const args = Array.prototype.slice.call(argz);
      params.forEach((param) => {
        singleParam[method].apply(param, args);
      });
    };
  });

  //allows to do parameter.value = x
  Object.defineProperties(parameter, {
    value: {
      get: function () {
        return singleParam.value;
      },
      set: function (value) {
        params.forEach((param) => {
          param.value = value;
        });
      },
    },
  });

  return parameter;
}

// add leading zeros to a number
export function pad(num: number | string, size: number = 2) {
  let numStr = num.toString();
  while (numStr.length < size) numStr = '0' + numStr;
  return numStr;
}
