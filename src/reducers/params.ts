import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import find from 'lodash/find';
import set from 'lodash/set';
import { initialParamsState } from '../initialState';
import { UpdateTrackParamPayload, UpdateModuleParamPayload, AddEffectPayload } from '../types/params';
import { KeyValuePair } from '../types/shared';

const initialState = initialParamsState;
const paramsSlice = createSlice({
  name: 'params',
  initialState,
  reducers: {
    setPlay(state, action: PayloadAction<boolean>) {
      state.global.playing = action.payload;
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
        const { trackId, field, paramGroup, param, value } = action.payload;
        const nest = state.tracks[trackId][field];
        if (paramGroup) {
          nest[paramGroup][param] = value;
        } else {
          nest[param] = value;
        }
      },
      prepare(payload: UpdateTrackParamPayload) {
        return { payload };
      },
    },
    updateModuleParam: {
      reducer(state, action: PayloadAction<UpdateModuleParamPayload>) {
        const { trackId, modId, path, value } = action.payload;
        const mod = find(state.tracks[trackId].signalChain, (mod) => mod.id === modId);
        set(mod, path, value);
      },
      prepare(payload: UpdateModuleParamPayload) {
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
    // todoDeleted(state, action) {
    //   delete state.entities[action.payload]
    // }
  },
});

export const { updateTrackParam, updateModuleParam, addEffect, setPlay, setGlobalParam } = paramsSlice.actions;

export default paramsSlice.reducer;
