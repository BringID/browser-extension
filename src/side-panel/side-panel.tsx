import React, { FC, useEffect } from 'react';
import browser from 'webextension-polyfill';
import { notarizationManager } from './services/notarization';
import { sendMessage } from '../common/core';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import { tasks } from '../common/core'
const SidePanel: FC = () => {


  useEffect(() => {
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.type) {
        case 'VERIFICATION_START':
          void notarizationManager.run(0);
          break;
        case 'NOTARIZE':
          void notarizationManager.run(request.task_id);
          break;

        default:
          console.log({ request });
      }
    });
  }, []);

  const { result, taskId } = useSelector((state: RootState) => {
    return state.notarization
  });

  const availableTasks = tasks()

  useEffect(() => {
    if (!result) {
      return
    }

    const credentialGroupId = availableTasks[taskId].credentialGroupId
      
    // @ts-ignore
    chrome.action.openPopup();
    window.setTimeout(() => {

      sendMessage({
        type: 'PRESENTATION',
        data: {
          presentationData: result,
          credentialGroupId
        }
      })

      window.close()

    }, 2000)
      

  }, [
    result
  ])

  return (
    <div>
      <h1>
        Side Panel 1

        notarizationResult: {result}
      </h1>
    </div>
  );
};

export default SidePanel;
