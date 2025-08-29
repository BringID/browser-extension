import browser from 'webextension-polyfill';
import { TWebsiteRequestType, TExtensionRequestType } from '../popup/types';
import getStorage from '../popup/db-storage';
import { getCurrentTab } from '../popup/utils';
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

  chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'offscreen') {
      port.onMessage.addListener((msg) => {
        console.log('[background] Message received via port', msg);

        if (msg.type === 'UPDATE_COMPLETED_INDICATOR') {
          chrome.action.setBadgeBackgroundColor({ color: 'green' });
          chrome.action.setBadgeText({ text: msg.completedCount });
        }
      });

      port.onDisconnect.addListener(() => {
        console.warn('[background] Port disconnected');
      });

      port.postMessage({ status: 'ok' });
    }

    if (port.name === 'popup') {
      port.onDisconnect.addListener(async function () {
        console.log('CLOSING POPUP');
        const tab = await getCurrentTab();

        if (tab) {
          chrome.tabs.sendMessage(tab.id as number, {
            type: TExtensionRequestType.proofs_rejected,
          });
        } else {
          alert('NO TAB DETECTED');
        }
      });
    }
  });

  browser.runtime.onMessageExternal.addListener(async function (
    request,
    _,
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
        return true;
      }

      case TWebsiteRequestType.request_proofs: {
        const { host, pointsRequired, dropAddress } = request;

        chrome.storage.local.set(
          { request: `${host}__${pointsRequired}__${dropAddress}` },
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
