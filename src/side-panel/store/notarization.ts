import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum NotarizationStatus {
  pending,
  running,
  completed,
  failed,
}

export interface NotarizationState {
  taskId: number;
  status: NotarizationStatus;
  progress: number;
  error?: Error;

  result?: string;

  // message => UI
  // result => UI
}

export const notarizationSlice = createSlice({
  name: 'notarization',
  initialState: <NotarizationState>{
    taskId: 0,
    status: NotarizationStatus.pending,
    progress: 0,
    error: undefined,
  },
  reducers: {
    set: (_: NotarizationState, action: PayloadAction<NotarizationState>) => {
      return { ...action.payload };
    },

    setStatus: (
      state: NotarizationState,
      action: PayloadAction<NotarizationStatus>,
    ) => {
      state.status = action.payload;
    },

    setProgress: (state: NotarizationState, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },

    setError: (state: NotarizationState, action: PayloadAction<Error>) => {
      console.log(3);
      state.error = action.payload;
    },

    setResult: (state: NotarizationState, action: PayloadAction<string>) => {
      state.result = action.payload;
    },

    // setResult
  },
});
