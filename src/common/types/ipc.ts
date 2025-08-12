import { JsonValue } from 'type-fest';

export type IPCRunTask = {
  type: 'RUN_TASK';
  task_id: number;
};

export type IPCPresentation = {
  type: 'PRESENTATION';
  data: JsonValue;
};

export type IPCMessage = IPCRunTask | IPCPresentation;
