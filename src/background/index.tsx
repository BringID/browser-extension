import browser from 'webextension-polyfill'
import { TWebsiteRequestType } from '../popup/types'
import getStorage from '../popup/db-storage'

(async () => {
  console.log('BACKGROUND LOADED')
  browser.runtime.onMessageExternal.addListener(
    async function(request, sender, sendResponse: (data: any) => void) {
      switch (request.type) {
        case TWebsiteRequestType.set_private_key: {
          await (await getStorage()).addUserKey(request.privateKey)
          return true; // Important for async response
        }


        case TWebsiteRequestType.open_extension: {
          // @ts-ignore
          chrome.action.openPopup()

          sendResponse({ status: "opened" })
          break
        }

        case TWebsiteRequestType.request_points: {
          const {
            host,
            pointsRequired,
            dropAddress
          } = request

          chrome.storage.local.set({ request: `${host}__${pointsRequired}__${dropAddress}` }, () => {
            // @ts-ignore
            chrome.action.openPopup()
          })

          break
        }
      }
    }
  )
})();

