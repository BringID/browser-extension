import browser from 'webextension-polyfill';
import { TWebsiteRequestType, TExtensionRequestType } from '../popup/types';
import getStorage from '../db-storage';
import getCurrentTab from '../common/utils/get-current-tab';
import getTabsByHost from '../common/utils/get-tabs-by-host';

import configs from '../configs';

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

  // related to options page
  // chrome.storage.sync.get('specialMode', ({ specialMode }) => {
  //   if (specialMode) {
  //     console.log("Special mode is ON!");
  //     // Do something cool here
  //   } else {
  //     console.log("Special mode is OFF.");
  //   }
  // });

  chrome.storage.onChanged.addListener((changes, area) => {
    console.log(changes)
    if (area === 'sync' && changes.devMode) {
      console.log("Special mode changed to:", changes.devMode.newValue);
    }
  });

  // related to options page


  chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'offscreen') {
      port.onMessage.addListener((msg) => {
        console.log('[background] Message received via port', msg);

        if (msg.type === 'UPDATE_COMPLETED_INDICATOR') {
          chrome.action.setBadgeBackgroundColor({ color: 'green' });
          chrome.action.setBadgeText({ text: msg.completedCount });
        } else if (msg.type === 'UPDATE_PENDING_INDICATOR') {
          chrome.action.setBadgeBackgroundColor({ color: 'yellow' });
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
      case TWebsiteRequestType.set_user_key: {
        await storage.addUserKey(request.privateKey, request.address);
        return true; // Important for async response
      }

      case TWebsiteRequestType.has_user_key: {
        console.log("HERE TWebsiteRequestType.has_user_key: ", sender)
        const userKey = await storage.getUserKey();

        if (sender.tab?.id !== undefined && sender.frameId !== undefined) {
          chrome.tabs.sendMessage(
            sender.tab.id,
            {
              type: TExtensionRequestType.has_user_key_response,
              hasUserKey: Boolean(userKey),
            },
            { frameId: sender.frameId }
          );
        }


        // not sure if needed
        const connectorTabs = await getTabsByHost(configs.CONNECTOR_HOSTS);
        connectorTabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id as number, {
            type: TExtensionRequestType.has_user_key_response,
            hasUserKey: Boolean(userKey),
          });
        });

        break;
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
