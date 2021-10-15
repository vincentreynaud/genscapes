import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialTrackState } from '../initialState';

const initialState = [initialTrackState];

type UpdateParamActionPayload = {
	module: string;
	param: string;
	value: number;
};

type SetAudioComponentActionPayload = {
	name: string;
	value: any;
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
				const { module, param, value } = action.payload;
				state[0][module][param] = value;
			},
			prepare(module, param, value) {
				return {
					payload: { module, param, value },
				};
			},
		},
		setAudioComponent: {
			reducer(state, action: PayloadAction<SetAudioComponentActionPayload>) {
				const { name, value } = action.payload;
				state[0].audio.components[name] = value;
			},
			prepare(name, value) {
				return {
					payload: { name, value },
				};
			},
		},
		// todoDeleted(state, action) {
		//   delete state.entities[action.payload]
		// }
	},
});

export const { updateParam, setAudioComponent } = tracksSlice.actions;

export default tracksSlice.reducer;
