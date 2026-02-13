// store.js
import { configureStore } from '@reduxjs/toolkit';
import { notarizationSlice } from './notarization';
import { taskSync } from "./middlewares";

export const store = configureStore({
  reducer: {
    notarization: notarizationSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(taskSync),
});

export type RootState = ReturnType<typeof store.getState>;
