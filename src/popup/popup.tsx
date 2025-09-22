import React, { FC, useEffect } from 'react';
import browser from 'webextension-polyfill';
import { Page } from '../components';
import { Home, Tasks } from './pages';
import './styles.css';
import { Navigate, Route, Routes } from 'react-router';
import getStorage from './db-storage';
import manager from './manager';
import { IPCPresentation, tasks } from '../common/core';
import store from './store';
import { setLoading, useVerifications } from './store/reducers/verifications';
import { sendMessage } from '../common/core/messages';
import { defineGroup, areArraysEqual, areObjectsEqual } from './utils';
import { useUser } from './store/reducers/user';
import { LoadingOverlay } from './components';

const Popup: FC = () => {
  const user = useUser();
  const verifications = useVerifications();

  useEffect(() => {
    chrome.action.setBadgeText({ text: '' });
    // to cleanup all notifications after open

    chrome.runtime.connect({ name: 'popup' });
    // connecting port

    const listener = async (request: IPCPresentation) => {
      switch (request.type) {
        case 'PRESENTATION':
          {
            store.dispatch(setLoading(true));

            try {
              const { presentationData, transcriptRecv, taskIndex } =
                request.data;

              const availableTasks = tasks();
              const currentTask = availableTasks[taskIndex];

              const groupData = defineGroup(transcriptRecv, currentTask.groups);

              console.log({
                groupData,
                presentationData,
                transcriptRecv,
              });

              if (groupData) {
                const { credentialGroupId, semaphoreGroupId } = groupData;

                const verify = await manager.runVerify(
                  presentationData,
                  credentialGroupId,
                );

                if (verify) {
                  await manager.saveVerification(verify, credentialGroupId);

                  sendMessage({
                    type: 'SIDE_PANEL_CLOSE',
                  });
                }
              }
            } catch (err) {
              store.dispatch(setLoading(false));
              console.log('ERROR: ', err);
            }
            store.dispatch(setLoading(false));
          }
          break;
        default:
          console.log({ request });
      }
    };

    browser.runtime.onMessage.addListener(listener);

    return () => {
      browser.runtime.onMessage.removeListener(listener);
    };
  }, []);

  useEffect(() => {
    let interval = 0;

    (async () => {
      const dbStorage = await getStorage();
      const verificationsFromStorage = await dbStorage.getVerifications();
      const userFromStorage = await dbStorage.getUser();

      if (!areObjectsEqual(user, userFromStorage)) {
        await dbStorage.syncUser();
      }

      if (
        !areArraysEqual(verifications.verifications, verificationsFromStorage)
      ) {
        await dbStorage.syncVerifications();
      }

      interval = window.setInterval(async () => {
        const verificationsFromStorage = await dbStorage.getVerifications();
        const userFromStorage = await dbStorage.getUser();
        if (!areObjectsEqual(user, userFromStorage)) {
          await dbStorage.syncUser();
        }

        if (
          !areArraysEqual(verifications.verifications, verificationsFromStorage)
        ) {
          await dbStorage.syncVerifications();
        }
      }, 2000);
    })();

    return () => window.clearInterval(interval);
  }, [verifications, user]);

  return (
    <Page>
      {user.loading && <LoadingOverlay />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Page>
  );
};

export default Popup;
