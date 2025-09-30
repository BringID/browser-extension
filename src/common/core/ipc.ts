import browser from 'webextension-polyfill';

export type IPCNotarize = {
  type: 'NOTARIZE';
  task_id: number;
  master_key: string;
};

export type IPCPresentation = {
  type: 'PRESENTATION';
  data: {
    presentationData: string;
    transcriptRecv: string;
    transcriptSent: string;
    taskIndex: number;
  };
};

export type IPCMessage = IPCNotarize | IPCPresentation;

export async function sendMessage(message: IPCMessage) {
  await browser.runtime.sendMessage(message);
}
