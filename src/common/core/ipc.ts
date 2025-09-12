import browser from 'webextension-polyfill';

export type IPCNotarize = {
  type: 'NOTARIZE';
  task_id: number;
};

export type IPCPresentation = {
  type: 'PRESENTATION';
  data: {
    presentationData: string;
    transcriptRecv: string;
    taskIndex: number;
  };
};

export type IPCMessage = IPCNotarize | IPCPresentation;

export async function sendMessage(message: IPCMessage) {
  await browser.runtime.sendMessage(message);
}
