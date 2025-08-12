import React, { FC, useEffect } from 'react';
import browser from 'webextension-polyfill';
import { Page } from '../components';
import { Home, Tasks } from './pages';
import './styles.css';
import { Navigate, Route, Routes, useNavigate } from 'react-router';
import getStorage from './db-storage';
import { useDispatch } from 'react-redux';
import { addVerifications } from './store/reducers/verifications';

const Popup: FC = () => {
  useEffect(() => {
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.type) {
        case 'VERIFICATION_FINISHED':
        default:
          console.log({ request });
      }
    });
  }, []);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      const dbStorage = await getStorage();
      await dbStorage.syncUser();
      await dbStorage.syncVerifications();
    })();
  }, []);

  return (
    <Page>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Page>
  );
};

export default Popup;
