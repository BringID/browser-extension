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
  error?: string;
  currentStep: number;
  result?: string;
  transcriptRecv?: string;

  // message => UI
  // result => UI
}


const initialState: NotarizationState = {
  taskId: 0,
  status: NotarizationStatus.pending,
  progress: 0,
  error: '',
  currentStep: 0,
}

export const notarizationSlice = createSlice({
  name: 'notarization',
  initialState,
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

    setError: (state: NotarizationState, action: PayloadAction<string | undefined>) => {

      console.log('ERROR SET: ', action.payload)
      state.error = action.payload;
    },

    setCurrentStep: (
      state: NotarizationState,
      action: PayloadAction<number>,
    ) => {
      state.currentStep = action.payload;
    },

    setResult: (state: NotarizationState, action: PayloadAction<string>) => {
      state.result = action.payload;
    },

    clear: (state: NotarizationState) => {
      console.log({
        initialState
      })
      state = {...initialState}
    },

    setTranscriptRecv: (
      state: NotarizationState,
      action: PayloadAction<string>,
    ) => {
      state.transcriptRecv = action.payload;
    },

    setTaskId: (state: NotarizationState, action: PayloadAction<number>) => {
      state.taskId = action.payload;
    },

    // setResult
  },
});
