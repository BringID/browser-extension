import React, { FC, useEffect } from 'react'
import browser from 'webextension-polyfill'

const Popup: FC = () => {
  useEffect(() => {
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      
      switch (request.type) {
        case 'VERIFICATION_FINISHED':
        default:
          console.log({ request })
      }
    })
    
  }, [])

  return (
    <div>
      <h1>
        Popup V23sss

        <button onClick={async () => {
          const [tab] = await browser.tabs.query({
            active: true,
            currentWindow: true
          })
          // @ts-ignore
          chrome.sidePanel.open({
            tabId: tab.id
          })
        }}>
          open sidebar
        </button>

        <button onClick={async () => {
          const response = await browser.runtime.sendMessage({
            type: 'VERIFICATION_START'
          })
        }}>
          Send message to sidebar
        </button>
      </h1>
    </div>
  );
}

export default Popup