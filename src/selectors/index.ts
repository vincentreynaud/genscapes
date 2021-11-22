import { find } from 'lodash';
import { RootState } from '../store';
import { EffectId } from '../types/tracks';

export const selectTrack = (state: RootState, trackId: number) => state.tracks[trackId];

export const selectEffect = (state: RootState, trackId: number, effectId: EffectId) =>
  find(state.tracks[trackId].effects, (effect) => effect.id === effectId);
