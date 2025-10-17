import React, { FC, useEffect, useRef } from 'react';
import { Page } from '../components';
import { Home, Tasks } from './pages';
import './styles.css';
import { Navigate, Route, Routes } from 'react-router';
import getStorage from '../db-storage';
import { useVerifications } from './store/reducers/verifications';
import { areArraysEqual, areObjectsEqual } from './utils';
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
