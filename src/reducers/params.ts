import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { find } from 'lodash';
import { AutoFilterOptions } from 'tone';
import { initialParamsState } from '../initialState';
import { EffectName, ModuleType, TrackEffectState } from '../types/params';
import { KeyValuePair } from '../types/shared';

const initialState = initialParamsState;

type UpdateParamActionPayload = {
  trackId: number;
  moduleType: ModuleType;
  paramGroup?: string;
  param: string;
  value: number;
};

type AddEffectActionPayload = {
  trackId: number;
  effect: TrackEffectState;
};

type UpdateEffectParamActionPayload = {
  trackId: number;
  effectName: EffectName;
  options: AutoFilterOptions;
};

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
    updateParam: {
      // instead do a similar implementation to updateEffectOptions: just throw the whole options in there
      reducer(state, action: PayloadAction<UpdateParamActionPayload>) {
        const { trackId, moduleType, paramGroup, param, value } = action.payload;
        const module = find(state.tracks[trackId].signalChain, (module) => module.type === moduleType);
        if (paramGroup) {
          module[paramGroup][param] = value;
        } else {
          module[param] = value;
        }
      },
      prepare(trackId, moduleType, param, value, paramGroup = '') {
        return {
          payload: { trackId, moduleType, param, value, paramGroup },
        };
      },
    },
    addEffect: {
      reducer(state, action: PayloadAction<AddEffectActionPayload>) {
        const { trackId, effect } = action.payload;
        state.tracks[trackId].signalChain.push(effect);
      },
      prepare(trackId, effect) {
        return { payload: { trackId, effect } };
      },
    },
    updateEffectOptions: {
      reducer(state, action: PayloadAction<UpdateEffectParamActionPayload>) {
        const { trackId, effectName, options } = action.payload;
        const effect = find(state.tracks[trackId].signalChain, (effect) => effect.name === effectName);
        if (effect) {
          effect.options = options;
        } else {
          console.log('could not find the effect object');
        }
      },
      prepare(trackId, effectName, options) {
        return { payload: { trackId, effectName, options } };
      },
    },
    // todoDeleted(state, action) {
    //   delete state.entities[action.payload]
    // }
  },
});

export const { updateParam, addEffect, updateEffectOptions, setPlay, setGlobalParam } = paramsSlice.actions;

export default paramsSlice.reducer;
