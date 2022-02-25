import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import find from 'lodash/find';
import set from 'lodash/set';
import {
  UpdateTrackParamPayload,
  UpdateModuleParamPayload,
  AddEffectPayload,
  UpdateAllParamsPayload,
  PolySynthParamsModule,
  TrackId,
} from '../types/params';
import { KeyValuePair } from '../types/shared';
import { initParamsState, initTrackState } from '../initialState';

let initialState = initParamsState();

const paramsSlice = createSlice({
  name: 'params',
  initialState,
  reducers: {
    setPlay(state, action: PayloadAction<boolean>) {
      state.global.playing = action.payload;
    },
    addTrack(state, action: PayloadAction<number>) {
      state.tracks[action.payload] = initTrackState();
    },
    deleteTrack(state, action: PayloadAction<TrackId>) {
      delete state.tracks[action.payload];
    },
    setGlobalParam: {
      reducer(state, action: PayloadAction<KeyValuePair>) {
        const { key, value } = action.payload;
        state.global[key] = value;
      },
      prepare(key, value) {
        return {
          payload: { key, value },
        };
      },
    },
    updateTrackParam: {
      reducer(state, action: PayloadAction<UpdateTrackParamPayload>) {
        const { trackId, path, value } = action.payload;
        set(state.tracks[trackId].sequ, path, value);
      },
      prepare(payload: UpdateTrackParamPayload) {
        return { payload };
      },
    },
    updateModuleParam: {
      reducer(state, action: PayloadAction<UpdateModuleParamPayload>) {
        const { trackId, modId, path, value } = action.payload;
        const mod = find(state.tracks[trackId].signalChain, (mod) => mod.id === modId);
        set(mod as PolySynthParamsModule, path, value);
      },
      prepare(payload: UpdateModuleParamPayload) {
        return { payload };
      },
    },
    updateAllParams: {
      reducer(state, action: PayloadAction<UpdateAllParamsPayload>) {
        const { value } = action.payload;
        state.tracks = value;
      },
      prepare(payload: UpdateAllParamsPayload) {
        return { payload };
      },
    },
    addEffect: {
      reducer(state, action: PayloadAction<AddEffectPayload>) {
        const { trackId, effect } = action.payload;
        state.tracks[trackId].signalChain.push(effect);
      },
      prepare(trackId, effect) {
        return { payload: { trackId, effect } };
      },
    },
  },
});

export const {
  addTrack,
  deleteTrack,
  updateTrackParam,
  updateModuleParam,
  updateAllParams,
  addEffect,
  setPlay,
  setGlobalParam,
} = paramsSlice.actions;

export default paramsSlice.reducer;
