// store.js
import { configureStore } from '@reduxjs/toolkit';
import { notarizationSlice } from './notarization';
import { devModeSync } from "./middlewares";

export const store = configureStore({
  reducer: {
    notarization: notarizationSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(devModeSync),
});

export type RootState = ReturnType<typeof store.getState>;
