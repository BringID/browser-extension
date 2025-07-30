import React, { FC, useEffect } from 'react'
import browser from 'webextension-polyfill'

const SidePanel: FC = () => {
  useEffect(() => {
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.type) {
        case 'VERIFICATION_START':
        default:
          console.log({ request })
      }
    })
  }, [])

  return (
    <div>
      <h1>
        Side Panel 1

        <button onClick={async () => {
          const response = await browser.runtime.sendMessage({
            type: 'VERIFICATION_FINISHED'
          })
        }}>
          Send message to popup
        </button>
      </h1>
    </div>
  );
}

export default SidePanel