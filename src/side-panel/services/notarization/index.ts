import { NotarizationTemplate } from './notarization-template';
import {
  AppleDevicesHandlerConfig,
  UberRidesHandlerConfig,
  XVerifiedFollowersHandlerConfig,
  BinanceKycHandlerConfig,
} from './handlers';
import { NotarizationManager } from './notarization-manager';
import { TTask } from '../../../common/types';

function getHandlerConfigForTask(taskId: string | undefined) {
  switch (taskId) {
    case '2':
      return UberRidesHandlerConfig;
    case '3':
      return XVerifiedFollowersHandlerConfig;
    case '6':
      return BinanceKycHandlerConfig;
    default:
      return AppleDevicesHandlerConfig;
  }
}

let notarizationManager: NotarizationManager | null = null;

export async function initNotarizationManager(): Promise<NotarizationManager> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['task'], (data) => {
      const task: TTask | null = data.task ? JSON.parse(data.task) : null;
      console.log('initNotarizationManager: task from storage', { task });

      const handlerConfig = getHandlerConfigForTask(task?.id);
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
