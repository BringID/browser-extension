import browser from 'webextension-polyfill';
import { TExtensionRequestType } from '../popup/types';

(async () => {
  loadScript('content.bundle.js');
  chrome.runtime.onMessage.addListener((message) => {
    switch (message.type) {

      case 'VERIFICATION_DATA_READY': {
        const { transcriptRecv, presentationData, requestId, origin} = message.payload;

        window.postMessage(
          {
            source: 'bringID extension',
            type: 'VERIFICATION_DATA_READY',
            payload: {
              transcriptRecv,
              presentationData
            },
            requestId
          },
          origin,
        );
        break;
      }

      case 'VERIFICATION_DATA_ERROR': {
        const { error, requestId, origin } = message.payload;

        window.postMessage(
          {
            source: 'bringID extension',
            type: 'VERIFICATION_DATA_ERROR',
            requestId,
            payload: {
              error
            }
          },
          origin,
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
