import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Gain, Pattern, PolySynth } from 'tone';
import { AudioModule, AudioState } from '../types/audio';
import { KeyValuePair } from '../types/shared';

const initialState = {
  tracks: {
    0: {
      signalChain: [],
      composition: {},
    },
  },
  global: {
    outputNode: null,
  },
} as AudioState;

interface SetGlobalAudioComponentPayload extends KeyValuePair {
  value: Gain | PolySynth;
}

type ChainTrackAudioComponentPayload = {
  trackId: number;
  value: AudioModule;
};

type SetTrackCompositionComponentPayload = {
  trackId: number;
  type: 'pattern';
  value: Pattern<string> | null | any;
};

const audioSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setGlobalAudioComponent: {
      reducer(state, action: PayloadAction<SetGlobalAudioComponentPayload>) {
        const { key, value } = action.payload;
        state.global[key] = value;
      },
      prepare(key, value) {
        return {
          payload: { key, value },
        };
      },
    },
    chainTrackAudioComponent: {
      reducer(state, action: PayloadAction<ChainTrackAudioComponentPayload>) {
        const { trackId, value } = action.payload;
        // find if there is already audio for this trackId?
        state.tracks[trackId].signalChain.push(value);
      },
      prepare(trackId, value) {
        return {
          payload: { trackId, value },
        };
      },
    },
    setTrackCompositionComponent: {
      reducer(state, action: PayloadAction<SetTrackCompositionComponentPayload>) {
        const { trackId, type, value } = action.payload;
        // find if there is already audio for this trackId
        if (state.tracks[trackId] && state.tracks[trackId].composition) {
          state.tracks[trackId].composition = { [type]: value };
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

export const { chainTrackAudioComponent, setTrackCompositionComponent, setGlobalAudioComponent } = actions;

export default reducer;
