import React, { FC, useEffect } from 'react'
import browser from 'webextension-polyfill'
import { Button, Page } from '../components'

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
    <Page>
      <h1>
        Popup V23sss

        <Button onClick={async () => {
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
        </Button>

        <Button onClick={async () => {
          const response = await browser.runtime.sendMessage({
            type: 'VERIFICATION_START'
          })
        }}>
          Send message to sidebar
        </Button>
      </h1>
    </Page>
  );
}

export default Popup