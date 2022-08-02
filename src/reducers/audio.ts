import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { find } from 'lodash';
import { Gain, Pattern, PolySynth } from 'tone';
import { initAudioState, initTrackAudioState } from '../initialState';
import { AudioModule, AudioState } from '../types/audio';
import { TrackId } from '../types/params';
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
    deleteTrack(state, action: PayloadAction<TrackId>) {
      const sourceMod = find(state.tracks[action.payload]?.signalChain, (mod) => mod.type === 'source');
      console.log(sourceMod);
      sourceMod?.toneNode.disconnect();
      delete state.tracks[action.payload];
    },
    chainTrackAudioComponent: {
      reducer(state, action: PayloadAction<ChainTrackAudioComponentPayload>) {
        const { trackId, value } = action.payload;
        if (state.tracks[trackId]) {
          state.tracks[trackId].signalChain.push(value);
        } else {
          console.log(`track ${trackId} doesn't exist`);
        }
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
        if (state.tracks[trackId]) {
          state.tracks[trackId].sequ = { [type]: value };
        } else {
          console.log(`track ${trackId} doesn't exist`);
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

export const {
  addTrack,
  deleteTrack,
  chainTrackAudioComponent,
  setTrackCompositionComponent,
  setGlobalAudioComponent,
} = actions;

export default reducer;
