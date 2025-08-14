import React, { FC } from 'react';
import browser from 'webextension-polyfill';
import { sendMessage } from '../../../common/core';

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
          await sendMessage({
            type: 'NOTARIZE',
            task_id: 0,
          });
        }}
      >
        Send message
      </button>
    </>
  );
};

export default DevDirectSidebarCallsComponent;
