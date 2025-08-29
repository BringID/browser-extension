import configs from '../popup/configs';

// @ts-ignore
window.bringID = true;
window.dispatchEvent(new CustomEvent('bringid_extension_loaded'));

window.addEventListener('message', (event) => {
  if (event.source !== window) return;

  switch (event.data.type) {
    //  from client to extension
    default: {
      chrome.runtime.sendMessage(configs.EXTENSION_ID, event.data);
    }
  }
});
