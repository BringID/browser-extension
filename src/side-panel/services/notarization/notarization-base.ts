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
  #resultCallback?: ResultCallback;

  constructor(task: Task) {
    super({
      progress: 0,
      status: NotarizationStatus.NotStarted,
    });
    this.task = task;
  }

  public async start(
    resultCallback: ResultCallback,
    updatesCallback?: OnStateUpdated<NotarizationStatus>,
  ): Promise<void> {
    if (this.state.status === NotarizationStatus.InProgress) {
      resultCallback(new Error('Notarization is already running'));
    }
    this.#resultCallback = resultCallback;
    if (updatesCallback) {
      this.onStateUpdated = updatesCallback;
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
      console.log(1);
      this.state = {
        progress: this.state.progress,
        status: NotarizationStatus.Stopped,
        error: res,
      };
      return;
    }
    this.state = {
      progress: 100,
      status: NotarizationStatus.Completed,
      error: undefined,
    };
    if (this.#resultCallback) {
      void this.#resultCallback(res);
    }
  }

  abstract onStart(): Promise<void>;
  abstract onStop(): Promise<void>;
}
