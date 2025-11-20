import type { Middleware } from "@reduxjs/toolkit";
import { notarizationSlice } from "../notarization";

const { setDevMode } = notarizationSlice.actions;

let initialized = false;
let lastKnownValue: boolean | undefined;


export const devModeSyncMiddleware: Middleware = (store) => {
  if (!initialized) {
    initialized = true;

    // 1️⃣ Load initial value from chrome.storage.sync
    chrome.storage.sync.get("devMode", (data) => {
      if (typeof data.devMode === "boolean") {
        lastKnownValue = data.devMode;
        store.dispatch(setDevMode(data.devMode));
      }
    });

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== "sync" || !changes.devMode) return;

      const newVal = Boolean(changes.devMode.newValue);
      const current = store.getState().notarization.devMode;

      if (newVal !== current) {
        lastKnownValue = newVal;
        store.dispatch(setDevMode(newVal));
      }
    });
  }

  return (next) => (action: any) => {
    const result = next(action);

    if (action.type === setDevMode.type) {
      const newValue = store.getState().notarization.devMode;

      // avoid loops
      if (newValue !== lastKnownValue) {
        lastKnownValue = newValue;
        console.log('HERE CHANGED DEVMODE')
        chrome.storage.sync.set({ devMode: newValue });
      }
    }

    return result;
  };
};


export default devModeSyncMiddleware