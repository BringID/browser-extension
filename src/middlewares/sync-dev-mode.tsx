// syncDevModeMiddleware.ts

import { Middleware } from 'redux';
import { setDevMode } from '../popup/store/reducers/user';

// This middleware keeps Redux and chrome.storage.sync in sync
export const syncDevModeMiddleware: Middleware = (store) => {
  // 1️⃣ Listen to Chrome storage changes → update Redux
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'sync') return;
    if (changes.devMode) {
      const newVal = Boolean(changes.devMode.newValue);
      const currentVal = store.getState().user.devMode;
      if (newVal !== currentVal) {
        store.dispatch(setDevMode(newVal));
      }
    }
  });

  // 2️⃣ Intercept Redux actions → update Chrome storage
  return (next) => (action) => {
    const result = next(action);

    if (action.type === '/user/setDevMode') {
      const devMode = store.getState().user.devMode;
      chrome.storage.sync.set({ devMode });
    }

    return result;
  };
};

export default syncDevModeMiddleware