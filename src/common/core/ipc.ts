import { JsonValue } from 'type-fest';
import browser from 'webextension-polyfill';

export type IPCRunTask = {
  type: 'RUN_TASK';
  task_id: number;
};

export type IPCPresentation = {
  type: 'PRESENTATION';
  data: JsonValue;
};

export type IPCMessage = IPCRunTask | IPCPresentation;

export async function sendMessage(message: IPCMessage) {
  await browser.runtime.sendMessage(message);
}
