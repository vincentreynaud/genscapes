import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { find } from 'lodash';
import { EnvelopeCurve } from 'tone';
import { Time } from 'tone/build/esm/core/type/Units';
import { initialParamsState } from '../initialState';
import {
  ModuleField,
  ModuleId,
  ModuleName,
  ModuleOptions,
  ModuleType,
  EffectParamsModule,
  TrackField,
} from '../types/params';
import { KeyValuePair } from '../types/shared';

const initialState = initialParamsState;

type AddEffectPayload = {
  trackId: number;
  effect: EffectParamsModule;
};

type UpdateTrackParamPayload = {
  trackId: number;
  field: TrackField;
  param: string;
  value: number | string | string[];
  paramGroup?: string;
};

type UpdateModuleParamsPayload = {
  trackId: number;
  modId: ModuleId;
  field: ModuleField;
  options: ModuleOptions;
};

type UpdateModuleParamPayload = {
  trackId: number;
  modId: ModuleId;
  field: ModuleField;
  param: string;
  value: UpdateModuleParamValue;
  paramGroup?: string;
};

export type UpdateModuleParamValue = number | Record<string, number | Time | string | EnvelopeCurve>;

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
        // let urlQuery = { ...state[0], [module]: { [param]: value } };
        // const url = new URL(document.location.href);
        // url.searchParams.set("track0", JSON.stringify(urlQuery));
        // window.history.replaceState({}, "title", url.href);
        // console.log(urlQuery);
      },
      prepare(payload: UpdateTrackParamPayload) {
        return { payload };
      },
    },
    updateModuleParam: {
      reducer(state, action: PayloadAction<UpdateModuleParamPayload>) {
        const { trackId, modId, field, paramGroup, param, value } = action.payload;
        const mod = find(state.tracks[trackId].signalChain, (mod) => mod.id === modId);
        if (paramGroup) {
          mod[field][paramGroup][param] = value;
        } else {
          mod[field][param] = value;
        }
      },
      prepare(payload: UpdateModuleParamPayload) {
        return { payload };
      },
    },
    updateModuleParams: {
      reducer(state, action: PayloadAction<UpdateModuleParamsPayload>) {
        const { trackId, modId, field, options } = action.payload;
        const mod = find(state.tracks[trackId].signalChain, (mod) => mod.id === modId);
        if (mod) {
          mod[field] = options;
        } else {
          console.error('reducers: could not find the module');
        }
      },
      prepare(trackId, modId, field, options) {
        return { payload: { trackId, modId, field, options } };
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

export const { updateTrackParam, updateModuleParam, addEffect, updateModuleParams, setPlay, setGlobalParam } =
  paramsSlice.actions;

export default paramsSlice.reducer;
