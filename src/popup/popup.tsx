import React, { FC, useEffect } from 'react';
import browser from 'webextension-polyfill';
import { Page } from '../components';
import { Home, Tasks } from './pages';
import './styles.css';
import { Navigate, Route, Routes, useNavigate } from 'react-router';
import getStorage from './db-storage';
import { useDispatch } from 'react-redux';
import { addVerifications } from './store/reducers/verifications';
import manager from './manager';
import { IPCPresentation } from '../common/core';

const Popup: FC = () => {
  useEffect(() => {
    browser.runtime.onMessage.addListener(async (request: IPCPresentation, sender, sendResponse) => {
      switch (request.type) {
        case 'PRESENTATION': {
            const {
              presentationData,
              credentialGroupId
            } = request.data

            if (presentationData) {

              const verify = await manager.runVerify(presentationData, credentialGroupId);

              if (verify) {
                await manager.saveVerification(
                  verify,
                  credentialGroupId
                );

              }
            }
          }
          break
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
