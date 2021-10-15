import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Gain } from 'tone';

type AudioState = {
	playing: boolean;
	volume: number;
	components: {
		masterVolume: Gain | null;
	};
};

type SetGlobalComponentActionPayload = {
	name: string;
	value: any;
};

const initialState = {
	playing: false,
	volume: 0.5,
	components: {
		masterVolume: null,
	},
} as AudioState;

const globalSlice = createSlice({
	name: 'global',
	initialState,
	reducers: {
		setPlay(state, action: PayloadAction<boolean>) {
			state.playing = action.payload;
		},
		setGlobalComponent: {
			reducer(state, action: PayloadAction<SetGlobalComponentActionPayload>) {
				const { name, value } = action.payload;
				state.components[name] = value;
			},
			prepare(name, value) {
				return {
					payload: { name, value },
				};
			},
		},
	},
});

export const { setPlay, setGlobalComponent } = globalSlice.actions;

export default globalSlice.reducer;
