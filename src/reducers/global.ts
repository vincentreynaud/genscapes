import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { KeyValuePair } from '../types/shared';

type GlobalState = {
	playing: boolean;
	volume: number;
};

const initialState = {
	playing: false,
	volume: 0.5,
} as GlobalState;

const globalSlice = createSlice({
	name: 'global',
	initialState,
	reducers: {
		setPlay(state, action: PayloadAction<boolean>) {
			state.playing = action.payload;
		},
		setGlobalParam: {
			reducer(state, action: PayloadAction<KeyValuePair>) {
				const { key, value } = action.payload;
				state[key] = value;
			},
			prepare(key, value) {
				return {
					payload: { key, value },
				};
			},
		},
	},
});

export const { setPlay, setGlobalParam } = globalSlice.actions;

export default globalSlice.reducer;
