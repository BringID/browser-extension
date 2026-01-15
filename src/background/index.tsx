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

        console.log({ request })
        const {
          payload: {
            task, //as string
            origin
          }
        } = request;

        chrome.storage.local.set(
          { request: `${task}__${origin}` },
          () => {
            // @ts-ignore
            chrome.action.openPopup();
          },
        );

        return true;
      }

      case TWebsiteRequestType.ping: {
        return true;
      }
    }
  });
})();
