import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { find } from 'lodash';
import { AutoFilterOptions } from 'tone';
import { initialParamsState } from '../initialState';
import { EffectId } from '../types/params';
import { KeyValuePair } from '../types/shared';

const initialState = initialParamsState;

type UpdateParamActionPayload = {
  trackId: number;
  module: string;
  paramGroup?: string;
  param: string;
  value: number;
};

type AddEffectActionPayload = {
  trackId: number;
  effect: any;
};

type UpdateEffectParamActionPayload = {
  trackId: number;
  effectId: EffectId;
  options: AutoFilterOptions;
};

const paramsSlice = createSlice({
  name: 'params',
  initialState,
  reducers: {
    // todoAdded(state, action) {
    //   const todo = action.payload
    //   state.entities[todo.id] = todo
    // },
    // todoToggled(state, action) {
    //   const todoId = action.payload
    //   const todo = state.entities[todoId]
    //   todo.completed = !todo.completed
    // },
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
      reducer(state, action: PayloadAction<UpdateParamActionPayload>) {
        const { trackId, module, paramGroup, param, value } = action.payload;
        if (paramGroup) {
          state.tracks[trackId][module][paramGroup][param] = value;
        } else {
          state.tracks[trackId][module][param] = value;
        }
      },
      prepare(trackId, module, param, value, paramGroup = '') {
        return {
          payload: { trackId, module, param, value, paramGroup },
        };
      },
    },
    addEffect: {
      reducer(state, action: PayloadAction<AddEffectActionPayload>) {
        const { trackId, effect } = action.payload;
        state.tracks[trackId].effects.push(effect);
      },
      prepare(trackId, effect) {
        return { payload: { trackId, effect } };
      },
    },
    updateEffectOptions: {
      reducer(state, action: PayloadAction<UpdateEffectParamActionPayload>) {
        const { trackId, effectId, options } = action.payload;
        const effect = find(state.tracks[trackId].effects, (effect) => effect.id === effectId);
        if (effect) {
          effect.options = options;
        } else {
          console.log('could not find the effect object');
        }
      },
      prepare(trackId, effectId, options) {
        return { payload: { trackId, effectId, options } };
      },
    },
    // todoDeleted(state, action) {
    //   delete state.entities[action.payload]
    // }
  },
});

export const { updateParam, addEffect, updateEffectOptions, setPlay, setGlobalParam } = paramsSlice.actions;

export default paramsSlice.reducer;
