import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { find } from 'lodash';
import { AutoFilterOptions } from 'tone';
import { initialTrackState } from '../initialState';
import { EffectId } from '../types/tracks';

const initialState = [initialTrackState];

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

const tracksSlice = createSlice({
  name: 'tracks',
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
    updateParam: {
      reducer(state, action: PayloadAction<UpdateParamActionPayload>) {
        const { trackId, module, paramGroup, param, value } = action.payload;
        if (paramGroup) {
          state[trackId][module][paramGroup][param] = value;
        } else {
          state[trackId][module][param] = value;
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
        state[trackId].effects.push(effect);
      },
      prepare(trackId, effect) {
        return { payload: { trackId, effect } };
      },
    },
    updateEffectOptions: {
      reducer(state, action: PayloadAction<UpdateEffectParamActionPayload>) {
        const { trackId, effectId, options } = action.payload;
        const effect = find(state[trackId].effects, (effect) => effect.id === effectId);
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

export const { updateParam, addEffect, updateEffectOptions } = tracksSlice.actions;

export default tracksSlice.reducer;
