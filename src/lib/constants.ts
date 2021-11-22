import { Note, Scale } from '@tonaljs/tonal';
import { range } from 'lodash';

export const NOTE_NAMES = Note.names(['C', 'C#', 'Dd', 'D', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']);
export const SCALE_TYPES = Scale.names();
export const OCTAVES = range(1, 8);

export const EFFECT_IDS = ['auto-filter', 'reverb', 'delay'];

export const EFFECT_NAMES_MAP = {
  'auto-filter': 'Auto Filter',
  reverb: 'Reverb',
  delay: 'Delay',
};
