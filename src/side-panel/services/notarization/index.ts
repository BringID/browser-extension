import { NotarizationTemplate } from './notarization-template';
import {
  AppleDevicesHandlerConfig,
  UberRidesHandlerConfig,
  XVerifiedFollowersHandlerConfig,
} from './handlers';
import { NotarizationManager } from './notarization-manager';
import { Task, tasks } from '../../../common/core';
import { store } from '../../store';

const state = store.getState()
const t: Task[] = tasks(state.notarization.devMode);

export const notarizationManager = new NotarizationManager([
  new NotarizationTemplate(UberRidesHandlerConfig, t[0]),
  new NotarizationTemplate(XVerifiedFollowersHandlerConfig, t[1]),
  new NotarizationTemplate(AppleDevicesHandlerConfig, t[2]),
]);
