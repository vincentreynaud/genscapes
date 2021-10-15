import { RootState } from '../store';

export const selectTrack = (state: RootState, trackId: number) => state.tracks[trackId];
