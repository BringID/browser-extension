import { NotarizationTemplate } from './notarization-template';
import {
  AppleDevicesHandlerConfig,
  UberRidesHandlerConfig,
  XVerifiedFollowersHandlerConfig,
} from './handlers';
import { NotarizationManager } from './notarization-manager';
import { Task, tasks } from '../../../common/core';

const t: Task[] = tasks();

export const notarizationManager = new NotarizationManager([
  new NotarizationTemplate(UberRidesHandlerConfig, t[0]),
  new NotarizationTemplate(XVerifiedFollowersHandlerConfig, t[1]),
  new NotarizationTemplate(AppleDevicesHandlerConfig, t[2]),
]);
