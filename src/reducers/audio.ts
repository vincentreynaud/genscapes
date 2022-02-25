import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Gain, Pattern, PolySynth } from 'tone';
import { initAudioState, initTrackAudioState } from '../initialState';
import { AudioModule } from '../types/audio';
import { KeyValuePair } from '../types/shared';

const initialState = initAudioState();

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
    addTrack(state, action: PayloadAction<number>) {
      state.tracks[action.payload] = initTrackAudioState();
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
        state.tracks[trackId].sequ = { [type]: value };
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

export const { addTrack, chainTrackAudioComponent, setTrackCompositionComponent, setGlobalAudioComponent } = actions;

export default reducer;
