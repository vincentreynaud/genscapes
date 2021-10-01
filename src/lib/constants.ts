import { Note, Scale } from "@tonaljs/tonal";
import { range } from "lodash";

export const NOTE_NAMES = Note.names(["C", "C#", "Dd", "D", "Eb", "E", "F", "F#", "Gb", "G", "Ab", "A", "Bb", "B"]);
export const SCALE_TYPES = Scale.names();
export const OCTAVES = range(1, 8);
