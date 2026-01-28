import browser from 'webextension-polyfill';
import { TWebsiteRequestType } from '../popup/types';


(async () => {

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'openPopup') {
      // @ts-ignore
      chrome.action.openPopup().catch((err) => {
        console.error('Failed to open popup:', err);
      });
    }
  });

  browser.runtime.onMessageExternal.addListener(async function (
    request,
    sender,
    sendResponse: (data: any) => void,
  ) {
    switch (request.type) {
      case TWebsiteRequestType.request_zktls_verification: {
        const { payload, requestId } = request;
        const tabId = sender.tab?.id;

        // Validation
        if (!payload?.task) {
          console.error('Invalid request: missing payload.task');
          return false;
        }
        if (!payload?.origin) {
          console.error('Invalid request: missing payload.origin');
          return false;
        }
        if (!requestId) {
          console.error('Invalid request: missing requestId');
          return false;
        }
        if (!tabId) {
          console.error('Invalid request: missing sender.tab.id');
          return false;
        }

        const { task, origin } = payload;

        chrome.storage.local.set(
          {
            request: {
              task,
              origin,
              requestId,
              tabId
            }
          },
          () => {
            // @ts-ignore
            chrome.action.openPopup();
          },
        )

        return true;
      }

      case TWebsiteRequestType.ping: {
        return true;
      }
    }
  });
})();
