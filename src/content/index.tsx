import browser from 'webextension-polyfill';
import { TExtensionRequestType } from '../popup/types';

(async () => {
  loadScript('content.bundle.js');
  chrome.runtime.onMessage.addListener((message) => {
    switch (message.type) {


      case 'VERIFICATION_DATA_READY': {
        window.postMessage(
          {
            source: 'bringID extension',
            payload: message.payload,
            type: 'VERIFICATION_DATA_READY'
          },
          '*',
        );
        break;
      }
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
