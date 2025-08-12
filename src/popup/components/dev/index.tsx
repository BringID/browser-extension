import React, { FC } from 'react';
import browser from 'webextension-polyfill';

const DevDirectSidebarCallsComponent: FC = () => {
  return (
    <>
      <button
        onClick={async () => {
          const [tab] = await browser.tabs.query({
            active: true,
            currentWindow: true,
          });
          // @ts-ignore
          chrome.sidePanel.open({
            tabId: tab.id,
          });
        }}
      >
        Open sidebar
      </button>

      <button
        onClick={async () => {
          await browser.runtime.sendMessage({
            type: 'VERIFICATION_START',
          });
        }}
      >
        Send message
      </button>
    </>
  );
};

export default DevDirectSidebarCallsComponent;
