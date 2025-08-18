import browser from 'webextension-polyfill';
import { TWebsiteRequestType } from '../popup/types';
import getStorage from '../popup/db-storage';

let creatingOffscreen: any;

async function createOffscreenDocument() {
  const offscreenUrl = browser.runtime.getURL('offscreen.html');
  // @ts-ignore
  const existingContexts = await browser.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl],
  });

  if (existingContexts.length > 0) {
    return;
  }

  if (creatingOffscreen) {
    await creatingOffscreen;
  } else {
    creatingOffscreen = (chrome as any).offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['WORKERS'],
      justification: 'workers for multithreading',
    });
    await creatingOffscreen;
    creatingOffscreen = null;
  }
}

(async () => {
  console.log('BACKGROUND LOADED');
  const storage = await getStorage();
  await createOffscreenDocument();

  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse: (data: any) => void,
  ) {
    switch (request.type) {
      case 'UPDATE_COMPLETED_INDICATOR':
        const { completedCount } = request;
        console.log('UPDATE_COMPLETED_INDICATOR');
        chrome.action.setBadgeBackgroundColor({ color: 'green' });
        chrome.action.setBadgeText({ text: completedCount });
        break;
    }
  });

  browser.runtime.onMessageExternal.addListener(async function (
    request,
    sender,
    sendResponse: (data: any) => void,
  ) {
    switch (request.type) {
      case TWebsiteRequestType.set_private_key: {
        await storage.addUserKey(request.privateKey);
        return true; // Important for async response
      }

      case TWebsiteRequestType.open_extension: {
        // @ts-ignore
        chrome.action.openPopup();

        sendResponse({ status: 'opened' });
        break;
      }

      case TWebsiteRequestType.request_points: {
        const { host, pointsRequired, dropAddress } = request;

        chrome.storage.local.set(
          { request: `${host}__${pointsRequired}__${dropAddress}` },
          () => {
            // @ts-ignore
            chrome.action.openPopup();
          },
        );

        break;
      }
    }
  });
})();
