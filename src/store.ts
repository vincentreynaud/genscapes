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
