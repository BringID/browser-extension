// store.js
import { configureStore } from '@reduxjs/toolkit';
import { notarizationSlice } from './notarization';

export const store = configureStore({
  reducer: {
    notarization: notarizationSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
