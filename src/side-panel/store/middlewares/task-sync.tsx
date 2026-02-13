import type { Middleware } from "@reduxjs/toolkit";
import { notarizationSlice } from "../notarization";

const { setTask } = notarizationSlice.actions;

let initialized = false;
let lastKnownValue: string | undefined;


export const devModeSyncMiddleware: Middleware = (store) => {
  if (!initialized) {
    initialized = true;

    // 1️⃣ Load initial value from chrome.storage.sync
    chrome.storage.sync.get("task", (data) => {
      if (typeof data.task === "string") {
        store.dispatch(setTask(JSON.parse(data.task)));
      }
    });
  }

  return (next) => (action: any) => {
    const result = next(action);

    if (action.type === setTask.type) {
      const newValue = JSON.stringify(store.getState().notarization.task)

      // avoid loops
      if (newValue !== lastKnownValue) {
        lastKnownValue = newValue;
        console.log('HERE CHANGED TASK')
        chrome.storage.sync.set({ task: newValue });
      }
    }

    return result;
  };
};


export default devModeSyncMiddleware