import { Task } from '../../../common/core';
import { Result } from '../../../common/types';
import {
  OnStateUpdated,
  State as ProgressiveState,
} from '../../common/helpers/progressive';
import { Presentation } from 'bringid-tlsn-js'
export enum NotarizationStatus {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  Completed = 'Completed',
  Stopped = 'Stopped',
}

export type ResultCallback = (presentation: Result<Presentation>) => void;

export interface NotarizationHandler {
  task: Task;
  state: ProgressiveState<NotarizationStatus>;
  start: (
    resultCallback: ResultCallback,
    updatesCallback?: OnStateUpdated<NotarizationStatus>,
    currentStepUpdateCallback?: (currentStep: number) => void,
  ) => Promise<void>;
  stop: () => Promise<void>;
}
