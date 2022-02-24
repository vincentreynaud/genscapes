import { createSlice, configureStore } from '@reduxjs/toolkit';

import reducer from './reducers';
import { compose, Store } from 'redux';

const middleware = [];

const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = configureStore({
	reducer,
	enhancers: composeEnhancers,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;

// export const { incremented, decremented } = counterSlice.actions
// // Can still subscribe to the store
// store.subscribe(() => console.log(store.getState()))

// // Still pass action objects to `dispatch`, but they're created for us
// store.dispatch(incremented())
// // {value: 1}
// store.dispatch(incremented())
// // {value: 2}
// store.dispatch(decremented())
// // {value: 1}
