import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TConnectionQuality, TTask } from '../../common/types';

export enum NotarizationStatus {
  pending,
  running,
  completed,
  failed,
}

export interface NotarizationState {
  taskId: number | null;
  status: NotarizationStatus;
  error?: string;
  currentStep: number;
  result?: string;
  transcriptRecv?: string;
  transcriptSent?: string;
  task: TTask | null
  progress: number;
  connectionQuality?: TConnectionQuality;
  eta?: number;
  speed?: string;

  // message => UI
  // result => UI
}

const initialState: NotarizationState = {
  taskId: null,
  status: NotarizationStatus.pending,
  progress: 0,
  error: '',
  task: null,
  currentStep: 0
};

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

    setTask: (
      state: NotarizationState,
      action: PayloadAction<TTask>,
    ) => {
      state.task = action.payload;
    },

    setProgress: (state: NotarizationState, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },

    setProgressData: (
      state: NotarizationState,
      action: PayloadAction<{
        progress: number;
        connectionQuality: TConnectionQuality;
        eta: number;
        speed: string;
      }>,
    ) => {
      state.progress = action.payload.progress;
      state.connectionQuality = action.payload.connectionQuality;
      state.eta = action.payload.eta;
      state.speed = action.payload.speed;
    },

    setError: (
      state: NotarizationState,
      action: PayloadAction<string | undefined>,
    ) => {
      console.log('ERROR SET: ', action.payload);
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
      state = { ...initialState };
    },

    setTranscriptRecv: (
      state: NotarizationState,
      action: PayloadAction<string>,
    ) => {
      state.transcriptRecv = action.payload;
    },

    setTranscriptSent: (
      state: NotarizationState,
      action: PayloadAction<string>,
    ) => {
      state.transcriptSent = action.payload;
    },

    setTaskId: (state: NotarizationState, action: PayloadAction<number>) => {
      state.taskId = action.payload;
    },

    // setResult
  },
});
