import { filter } from 'lodash';
import { createSelector } from 'reselect';
import { RootState } from '../store';
import { ParamModuleType } from '../types/params';

export const selectParams = (state) => state.params;
export const selectTracksParams = (state) => state.params.tracks;
export const selectTracksAudio = (state) => state.audio.tracks;
export const selectGlobalParams = (state: RootState) => state.params.global;
export const selectGlobalAudio = (state: RootState) => state.audio.global;

export const makeSelectParamComponentByType = (trackId: number, type: ParamModuleType) =>
  createSelector(selectTracksParams, (tracks) =>
    filter(tracks[trackId].signalChain, (component) => component.type === type)
  );

export const makeSelectTrackParams = (trackId: number) =>
  createSelector(selectTracksParams, (tracks) => tracks[trackId]);

export const makeSelectTrackAudio = (trackId: number) => createSelector(selectTracksAudio, (tracks) => tracks[trackId]);
