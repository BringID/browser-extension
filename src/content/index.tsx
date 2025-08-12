import browser from 'webextension-polyfill';
import { TExtensionRequestType } from '../popup/types';

(async () => {
  loadScript('content.bundle.js');
  console.log('content/index loaded');
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === TExtensionRequestType.proofs_generated) {
      // goes to website, connected to extension
      window.postMessage(
        {
          source: 'bringID extension',
          data: message.payload,
          type: TExtensionRequestType.claim,
        },
        '*',
      );
    }
  });
})();

function loadScript(filename: string) {
  const url = browser.runtime.getURL(filename);
  const script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', url);
  document.body.appendChild(script);
}
