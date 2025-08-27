import React, { FC, useEffect } from 'react';
import browser from 'webextension-polyfill';
import { Page } from '../components';
import { Home, Tasks } from './pages';
import './styles.css';
import { Navigate, Route, Routes } from 'react-router';
import getStorage from './db-storage';
import manager from './manager';
import { IPCPresentation } from '../common/core';
import store from './store';
import { setLoading } from './store/reducers/verifications';

const Popup: FC = () => {
  useEffect(() => {
    chrome.action.setBadgeText({ text: '' });

    browser.runtime.onMessage.addListener(async (request: IPCPresentation) => {
      switch (request.type) {
        case 'PRESENTATION':
          {
            store.dispatch(setLoading(true));

            try {
              const { presentationData, credentialGroupId } = request.data;

              if (presentationData) {
                const verify = await manager.runVerify(
                  presentationData,
                  credentialGroupId,
                );

                if (verify) {
                  await manager.saveVerification(verify, credentialGroupId);
                }
              }
            } catch (err) {
              store.dispatch(setLoading(false));
              console.log('ERROR: ', err);
            }
            store.dispatch(setLoading(false));

            // browser.runtime.sendMessage({
            //   type: 'SIDE_PANEL_CLOSE'
            // })
          }
          break;
        default:
          console.log({ request });
      }
    });
  }, []);

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
