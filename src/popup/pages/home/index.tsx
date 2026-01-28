import React, { FC, useState, useEffect } from 'react';
import { Container } from './styled-components';
import {
  ConfirmationOverlay,
} from '../../components';

const Home: FC = () => {

  const [confirmationOverlayShow, setConfirmationOverlayShow] =
    useState<boolean>(false);

  const [task, setTask] = useState<string>('');
  const [requestOrigin, setRequestOrigin] = useState<string>('');
  const [requestId, setRequestId] = useState<string>('');
  const [tabId, setTabId] = useState<number | null>(null);



  useEffect(() => {
    chrome.storage.local.get('request', (data) => {
      if (!data || !data.request) {
        return chrome.storage.local.set({ request: `` });
      }

      const { task, origin, requestId, tabId } = data.request;

      if (task) {
        setTask(task);
        setRequestOrigin(origin);
        setRequestId(requestId);
        setTabId(tabId);
        setConfirmationOverlayShow(true);
      }

      chrome.storage.local.set({ request: null }, () => {
        console.log('request data deleted');
      });
    });
  }, []);

  return (
    <Container>
      {confirmationOverlayShow && <ConfirmationOverlay
        task={task}
        origin={requestOrigin}
        requestId={requestId}
        tabId={tabId}
        onClose={() => {
          setConfirmationOverlayShow(false)
        }}
      ></ConfirmationOverlay>}
    </Container>
  );
};

export default Home;
