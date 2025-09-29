import browser from 'webextension-polyfill';

export type TSidepanelCloseRequest = {
  type: string;
};

export type TSidepanelNotarizeRequest = {
  type: string;
  task_id: number;
  master_key: string;
};

export type TMessage = TSidepanelCloseRequest | TSidepanelNotarizeRequest;

export async function sendMessage(message: TMessage) {
  await browser.runtime.sendMessage(message);
}
