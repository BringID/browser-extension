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
import { sendMessage } from '../common/core/messages';

const Popup: FC = () => {
  useEffect(() => {
    chrome.action.setBadgeText({ text: '' });
    // to cleanup all notifications after open

    const listener = async (request: IPCPresentation) => {
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
              
                  sendMessage({
                    type: 'SIDE_PANEL_CLOSE'
                  })
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
    }

    browser.runtime.onMessage.addListener(listener);

    return () => {
      browser.runtime.onMessage.removeListener(listener);
    }
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
