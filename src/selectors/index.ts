import { find } from 'lodash';
import { RootState } from '../store';
import { EffectId } from '../types/params';

export const selectTrack = (state: RootState, trackId: number) => state.params.tracks[trackId];

export const selectEffect = (state: RootState, trackId: number, effectId: EffectId) =>
  find(state.params.tracks[trackId].effects, (effect) => effect.id === effectId);
