import { JsonValue } from 'type-fest';
import browser from 'webextension-polyfill';

export type IPCNotarize = {
  type: 'NOTARIZE';
  task_id: number;
};

export type IPCPresentation = {
  type: 'PRESENTATION';
  data: JsonValue;
};

export type IPCMessage = IPCNotarize | IPCPresentation;

export async function sendMessage(message: IPCMessage) {
  await browser.runtime.sendMessage(message);
}
