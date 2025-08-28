import configs from '../popup/configs';

import { TWebsiteRequestType } from '../popup/types';

// @ts-ignore
window.bringID = true;
window.dispatchEvent(new CustomEvent('bringid_extension_loaded'));

window.addEventListener('message', (event) => {
  if (event.source !== window) return;

  switch (event.data.type) {
    //  from client to extension
    case TWebsiteRequestType.set_private_key: {
      chrome.runtime.sendMessage(
        configs.EXTENSION_ID,
        event.data,
        (response) => {
          console.log('Background response:', response);
        },
      );
      break;
    }

    case TWebsiteRequestType.open_extension: {
      chrome.runtime.sendMessage(
        configs.EXTENSION_ID,
        event.data,
        (response) => {
          console.log('Background response:', response);
        },
      );
      break;
    }

    case TWebsiteRequestType.request_proofs: {
      console.log(event.data);
      chrome.runtime.sendMessage(configs.EXTENSION_ID, event.data);
      break;
    }
  }
});
