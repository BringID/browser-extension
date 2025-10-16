import React, { FC, useEffect, useRef } from 'react';
import browser from 'webextension-polyfill';
import { Page } from '../components';
import { Home, Tasks } from './pages';
import './styles.css';
import { Navigate, Route, Routes } from 'react-router';
import getStorage from '../db-storage';
import manager from '../manager';
import { IPCPresentation, tasks } from '../common/core';
import store from './store';
import { setLoading, useVerifications } from './store/reducers/verifications';
import { sendMessage } from '../common/core/messages';
import { areArraysEqual, areObjectsEqual } from './utils';
import { defineGroup } from '../common/utils';
import { useUser } from './store/reducers/user';
import { LoadingOverlay } from './components';
import { TVerification, TUser } from '../common/types';

const Popup: FC = () => {
  const user = useUser();
  const verifications = useVerifications();
  const verificationsRef = useRef<TVerification[]>(verifications.verifications);
  const userRef = useRef<TUser>(user);

  useEffect(() => {
    verificationsRef.current = verifications.verifications;
    userRef.current = user;
  }, [verifications.verifications, user]);

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

            // try {
            //   const { presentationData, transcriptRecv, taskIndex } =
            //     request.data;

            //   const availableTasks = tasks();
            //   const currentTask = availableTasks[taskIndex];

            //   const groupData = defineGroup(transcriptRecv, currentTask.groups);

            //   if (groupData) {
            //     const { credentialGroupId, semaphoreGroupId } = groupData;

            //     const verify = await manager.runVerify(
            //       presentationData,
            //       credentialGroupId,
            //     );

            //     if (verify) {
            //       await manager.saveVerification(verify, credentialGroupId);

            //       sendMessage({
            //         type: 'SIDE_PANEL_CLOSE',
            //       });
            //     }
            //   }
            // } catch (err) {
            //   store.dispatch(setLoading(false));
            //   console.log('ERROR: ', err);
            // }
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

      if (userRef && !areObjectsEqual(userRef.current, userFromStorage)) {
        await dbStorage.syncUser();
      }

      if (!areArraysEqual(verificationsRef.current, verificationsFromStorage)) {
        await dbStorage.syncVerifications();
      }

      interval = window.setInterval(async () => {
        const verificationsFromStorage = await dbStorage.getVerifications();
        const userFromStorage = await dbStorage.getUser();
        if (!areObjectsEqual(userRef.current, userFromStorage)) {
          await dbStorage.syncUser();
        }

        if (
          !areArraysEqual(verificationsRef.current, verificationsFromStorage)
        ) {
          await dbStorage.syncVerifications();
        }
      }, 2000);
    })();

    return () => window.clearInterval(interval);
  }, []);

  return (
    <Page>
      {user.loading && <LoadingOverlay title="Loading verifications..." />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Page>
  );
};

export default Popup;
