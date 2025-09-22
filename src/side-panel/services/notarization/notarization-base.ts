import { Result } from '../../../common/types';
import { Task } from '../../../common/core';
import {
  NotarizationHandler,
  NotarizationStatus,
  ResultCallback,
} from './types';
import { OnStateUpdated, Progressive } from '../../common/helpers/progressive';
import { Presentation } from 'tlsn-js';

export abstract class NotarizationBase
  extends Progressive<NotarizationStatus>
  implements NotarizationHandler
{
  public readonly task: Task;
  public currentStep: number;

  #resultCallback?: ResultCallback;

  currentStepUpdateCallback?: (currentStep: number) => void;

  constructor(task: Task) {
    super({
      progress: 0,
      status: NotarizationStatus.NotStarted,
    });
    this.task = task;
    this.currentStep = 0;
  }

  public async start(
    resultCallback: ResultCallback,
    updatesCallback?: OnStateUpdated<NotarizationStatus>,
    currentStepUpdateCallback?: (currentStep: number) => void,
  ): Promise<void> {
    if (this.state.status === NotarizationStatus.InProgress) {
      resultCallback(new Error('Notarization is already running'));
    }
    this.#resultCallback = resultCallback;
    if (updatesCallback) {
      this.onStateUpdated = updatesCallback;
    }
    if (currentStepUpdateCallback) {
      this.currentStepUpdateCallback = currentStepUpdateCallback;
    }
    this.state = {
      progress: 0,
      status: NotarizationStatus.InProgress,
      error: undefined,
    };
    void this.onStart();
  }

  public async stop(): Promise<void> {
    this.setStatus(NotarizationStatus.Stopped);
    return this.onStop();
  }

  protected result(res: Result<Presentation>) {
    if (res instanceof Error) {
      this.state = {
        progress: this.state.progress,
        status: NotarizationStatus.Stopped,
        error: res,
      };
      if (this.#resultCallback) this.#resultCallback(res);
      return;
    }

    this.state = {
      progress: 100,
      status: NotarizationStatus.Completed,
      error: undefined,
    };
    this.currentStep = 3;
    if (this.currentStepUpdateCallback)
      this.currentStepUpdateCallback(this.currentStep);
    if (this.#resultCallback) {
      void this.#resultCallback(res);
    }
  }

  abstract onStart(): Promise<void>;
  abstract onStop(): Promise<void>;
}
