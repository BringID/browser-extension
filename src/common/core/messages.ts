import browser from 'webextension-polyfill';

export type TSidepanelCloseRequest = {
  type: string;
};

export type TSidepanelNotarizeRequest = {
  type: string;
  task_id: number;
};

export type TMessage = TSidepanelCloseRequest | TSidepanelNotarizeRequest;

export async function sendMessage(message: TMessage) {
  await browser.runtime.sendMessage(message);
}
