import { NotarizationTemplate } from './notarization-template';
import {
  AppleDevicesHandlerConfig,
  UberRidesHandlerConfig,
  XVerifiedFollowersHandlerConfig,
} from './handlers';
import { NotarizationManager } from './notarization-manager';
import { store } from '../../store';
import { TTask } from '../../../common/types';

const state = store.getState()
const currentTask = state.notarization.task

let taskInstance
if (currentTask?.id === '2') {
  taskInstance = UberRidesHandlerConfig
} else if (currentTask?.id === '3') {
  taskInstance = XVerifiedFollowersHandlerConfig
} else {
  taskInstance = AppleDevicesHandlerConfig
}

export const notarizationManager = new NotarizationManager([
  new NotarizationTemplate(taskInstance, currentTask as TTask),
]);
