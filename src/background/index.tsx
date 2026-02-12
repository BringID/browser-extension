import browser from 'webextension-polyfill';
import { TWebsiteRequestType } from '../common/types';

// Track active side panel connections
const sidePanelPorts = new Map<number, { tabId: number; requestId: string; origin: string }>();

(async () => {

  // Open side panel when extension icon is clicked
  chrome.action.onClicked.addListener((tab) => {
    if (tab.id) {
      // @ts-ignore
      chrome.sidePanel.open({ tabId: tab.id });
    }
  });

  // Listen for side panel port connections
  chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'side-panel') {
      const portId = Date.now();

      port.onMessage.addListener((msg) => {
        if (msg.type === 'REGISTER_SESSION') {
          console.log('Side panel registered:', msg);
          sidePanelPorts.set(portId, {
            tabId: msg.tabId,
            requestId: msg.requestId,
            origin: msg.origin
          });
        }
      });

      port.onDisconnect.addListener(() => {
        console.log('Side panel disconnected');
        const session = sidePanelPorts.get(portId);
        if (session && session.tabId && session.requestId) {
          console.log('Sending cancellation to tab:', session.tabId);
          chrome.tabs.sendMessage(session.tabId, {
            type: 'VERIFICATION_DATA_ERROR',
            payload: {
              error: 'USER_CANCELLED',
              requestId: session.requestId,
              origin: session.origin
            }
          }).catch((err) => {
            console.error('Failed to send cancellation to tab:', err);
          });
          chrome.tabs.update(session.tabId, { active: true });
          chrome.tabs.get(session.tabId).then(tab => {
            if (tab.windowId) chrome.windows.update(tab.windowId, { focused: true });
          });
        }
        sidePanelPorts.delete(portId);
      });
    }
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log({ message })

    // Handle unregistering session (successful completion)
    if (message.type === 'UNREGISTER_SESSION') {
      // Find and remove the session so disconnect doesn't send cancellation
      for (const [portId, session] of sidePanelPorts.entries()) {
        if (session.requestId === message.requestId) {
          sidePanelPorts.delete(portId);
          console.log('Session unregistered:', message.requestId);
          break;
        }
      }
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
        console.log('background: ', { tabId })
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
            task,
            requestMeta: {
              requestId,
              tabId,
              origin
            }
          },
          () => {

            // @ts-ignore
            chrome.sidePanel.open({ tabId });
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
