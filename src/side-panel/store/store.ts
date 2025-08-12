// store.js
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { notarizationSlice } from './notarization';

export const store = configureStore({
  reducer: {
    notarization: notarizationSlice.reducer,
  },
});
