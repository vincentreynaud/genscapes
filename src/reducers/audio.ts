import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Gain, Pattern, PolySynth, Synth } from 'tone';
import { AudioState } from '../types/audio';
import { KeyValuePair } from '../types/shared';

const initialState = {
  tracks: {
    0: {},
  },
  global: {
    outputNode: null,
  },
} as AudioState;

interface SetGlobalAudioComponentActionPayload extends KeyValuePair {
  value: Gain | PolySynth;
}

type SetTrackAudioComponentActionPayload = {
  trackId: number;
  type: 'synthNode';
  value: Synth | PolySynth;
};

type SetTrackCompositionComponentActionPayload = {
  trackId: number;
  type: 'pattern';
  value: Pattern<string> | null | any;
};

const audioSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setGlobalAudioComponent: {
      reducer(state, action: PayloadAction<SetGlobalAudioComponentActionPayload>) {
        const { key, value } = action.payload;
        state.global[key] = value;
      },
      prepare(key, value) {
        return {
          payload: { key, value },
        };
      },
    },
    setTrackAudioComponent: {
      reducer(state, action: PayloadAction<SetTrackAudioComponentActionPayload>) {
        const { trackId, type, value } = action.payload;
        // find if there is already audio for this trackId?
        state.tracks[trackId] = {
          ...state.tracks[trackId],
          [type]: value,
          composition: {},
        };
      },
      prepare(trackId, type, value) {
        return {
          payload: { trackId, type, value },
        };
      },
    },
    setTrackCompositionComponent: {
      reducer(state, action: PayloadAction<SetTrackCompositionComponentActionPayload>) {
        const { trackId, type, value } = action.payload;
        // find if there is already audio for this trackId
        if (state.tracks[trackId] && state.tracks[trackId].composition) {
          const updatedTrack = {
            ...state.tracks[trackId],
            composition: { [type]: value },
          };
          state.tracks[trackId] = updatedTrack;
        }
      },
      prepare(trackId: number, type: 'pattern', value: Pattern<string> | null) {
        return {
          payload: { trackId, type, value },
        };
      },
    },
  },
});

const { actions, reducer } = audioSlice;

export const { setTrackAudioComponent, setTrackCompositionComponent, setGlobalAudioComponent } = actions;

export default reducer;
