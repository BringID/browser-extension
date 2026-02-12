import { NotarizationTemplate } from './notarization-template';
import {
  AppleSubscriptionsHandlerConfig,
  UberRidesHandlerConfig,
  BinanceKycHandlerConfig,
  OkxKycHandlerConfig
} from './handlers';
import { NotarizationManager } from './notarization-manager';
import { TTask } from '../../../common/types';

function getHandlerConfigForTask(taskId: string | undefined) {
  switch (taskId) {
    case '100':
      return UberRidesHandlerConfig;
    case '102':
      return BinanceKycHandlerConfig;
    case '103':
      return OkxKycHandlerConfig;
    case '104':
      return AppleSubscriptionsHandlerConfig;
    default:
      return null
  }
}

let notarizationManager: NotarizationManager | null = null;

export async function initNotarizationManager(): Promise<NotarizationManager> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['task'], (data) => {
      const task: TTask | null = data.task ? JSON.parse(data.task) : null;
      console.log('initNotarizationManager: task from storage', { task });

      const handlerConfig = getHandlerConfigForTask(task?.id);

      if (!handlerConfig) {
        return reject(`NO TASK FOUND FOR TASK ID: ${task?.id}`)
      }
      notarizationManager = new NotarizationManager([
        new NotarizationTemplate(handlerConfig, task as TTask),
      ]);

      resolve(notarizationManager);
    });
  });
}

export function getNotarizationManager(): NotarizationManager | null {
  return notarizationManager;
}
