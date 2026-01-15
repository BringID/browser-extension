import React, { FC, useState, useEffect } from 'react';
import { Container } from './styled-components';
import {
  ConfirmationOverlay,
} from '../../components';

const Home: FC = () => {

  const [confirmationOverlayShow, setConfirmationOverlayShow] =
    useState<boolean>(false);
  const [ task, setTask ] = useState<string>('');
  const [ requestOrigin , setRequestOrigin] = useState<string>('');



  useEffect(() => {
    chrome.storage.local.get('request', (data) => {
      if (!data || !data.request) {
        return chrome.storage.local.set({ request: `` });
      }

      const [
        task,
        origin
      ] = data.request.split('__')

      if (task) {
        setTask(task)
        setRequestOrigin(origin)
        setConfirmationOverlayShow(true);
      }

      chrome.storage.local.set({ request: null }, () => {
        console.log('request data deleted');
      });
    });
  }, []);

  const onRequestClose = () => {
    setTask('')
    setConfirmationOverlayShow(false)
  };

  return (
    <Container>
      {confirmationOverlayShow && <ConfirmationOverlay
        task={task}
        origin={origin}
        onClose={() => {
          setConfirmationOverlayShow(false)
        }}
      ></ConfirmationOverlay>}
    </Container>
  );
};

export default Home;
