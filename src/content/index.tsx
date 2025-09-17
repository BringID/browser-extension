import browser from 'webextension-polyfill';
import { TExtensionRequestType } from '../popup/types';

(async () => {
  loadScript('content.bundle.js');
  chrome.runtime.onMessage.addListener((message) => {

    switch (message.type) {
      case TExtensionRequestType.logout: {
        window.postMessage(
          {
            source: 'bringID extension',
            type: TExtensionRequestType.logout,
          },
          '*',
        );
        break
      }

      case TExtensionRequestType.proofs_generated: {
        window.postMessage(
          {
            source: 'bringID extension',
            data: message.payload,
            type: TExtensionRequestType.receive_proofs,
          },
          '*',
        );
        break
      }

      case TExtensionRequestType.proofs_rejected: {
        window.postMessage(
          {
            source: 'bringID extension',
            type: TExtensionRequestType.proofs_rejected,
          },
          '*',
        );

        break
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
