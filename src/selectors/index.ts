import { filter } from 'lodash';
import { createSelector } from 'reselect';
import { RootState } from '../store';
import { ToneSignalNode, ToneSourceNode } from '../types/audio';
import { ModuleType } from '../types/params';

export type SelectSourceNodes = (state: RootState) => ToneSourceNode[];
export type SelectEffectNodes = (state: RootState) => ToneSourceNode[];

export const selectParams = (state: RootState) => state.params;
export const selectTracksParams = (state: RootState) => state.params.tracks;
export const selectTracksAudio = (state: RootState) => state.audio.tracks;
export const selectGlobalParams = (state: RootState) => state.params.global;
export const selectGlobalAudio = (state: RootState) => state.audio.global;

export const makeSelectParamModuleByType = (trackId: number, type: ModuleType) =>
  createSelector(selectTracksParams, (tracks) => filter(tracks[trackId].signalChain, (mod) => mod.type === type));

export const makeSelectAudioModuleByType = (trackId: number, type: ModuleType) =>
  createSelector(selectTracksAudio, (tracks) => filter(tracks[trackId].signalChain, (mod) => mod.type === type));

export const makeSelectToneNodesByType = (trackId: number, type: ModuleType) =>
  createSelector(selectTracksAudio, (tracks): ToneSignalNode[] => {
    console.log(trackId);
    return filter(tracks[trackId].signalChain, (mod) => mod.type === type).map((mod) => mod?.toneNode);
  });

export const makeSelectTrackParams = (trackId: number) =>
  createSelector(selectTracksParams, (tracks) => tracks[trackId]);

export const makeSelectTrackAudio = (trackId: number) => createSelector(selectTracksAudio, (tracks) => tracks[trackId]);
