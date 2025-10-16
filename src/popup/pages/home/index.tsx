import React, { FC, useState, useEffect } from 'react';
import { Container, VerificationsListStyled } from './styled-components';
import { Header } from '../../components';
import { useNavigate } from 'react-router';
import { useVerifications } from '../../store/reducers/verifications';
import { Task, tasks } from '../../../common/core/task';
import {
  ConfirmationOverlay,
  LoadingOverlay,
  Authorize,
} from '../../components';
import { calculateAvailablePoints } from '../../../common/utils';
import { useUser } from '../../store/reducers/user';
import { TVerification } from '../../../common/types';

const renderContent = (
  userKey: string | null,
  availableTasks: Task[],
  verifications: TVerification[],
  navigate: (location: string) => void,
) => {
  if (!userKey) {
    return <Authorize />;
  }

  return (
    <VerificationsListStyled
      tasks={availableTasks}
      verifications={verifications}
      onAddVerifications={() => {
        navigate('/tasks');
      }}
    />
  );
};

const Home: FC = () => {
  const verificationsStore = useVerifications();
  const { verifications, loading } = verificationsStore;
  const availableTasks = tasks();

  const [confirmationOverlayShow, setConfirmationOverlayShow] =
    useState<boolean>(false);
  const [timerOverlayShow, setTimerOverlayShow] = useState<boolean>(false);
  const [requestHost, setRequestHost] = useState<string>('');
  const [pointsRequired, setPointsRequired] = useState<string>('');
  const [dropAddress, setDropAddress] = useState<string>('');

  const [scheduledTime, setScheduledTime] = useState<number | null>(null);

  const availablePoints = calculateAvailablePoints(verifications);

  const navigate = useNavigate();
  const user = useUser();

  useEffect(() => {
    chrome.storage.local.get('request', (data) => {
      if (!data || !data.request) {
        return chrome.storage.local.set({ request: `` });
      }

      const [host, pointsRequired, dropAddress] = data.request.split(`__`);

      if (host && pointsRequired && dropAddress) {
        setDropAddress(dropAddress);
        setPointsRequired(pointsRequired);
        setRequestHost(host);
        setConfirmationOverlayShow(true);
      }

      chrome.storage.local.set({ request: null }, () => {
        console.log('request data deleted');
      });
    });
  }, []);

  useEffect(() => {
    if (!verifications) {
      return;
    }
    const findNotCompleted = verifications.find(
      (verification) => verification.status !== 'completed',
    );

    if (findNotCompleted) {
      const now = +new Date();
      if (now >= findNotCompleted.scheduledTime) {
        return;
      }

      setScheduledTime(findNotCompleted.scheduledTime);
      setTimerOverlayShow(true);
    } else {
      setScheduledTime(null);
      setTimerOverlayShow(false);
    }
  }, [verifications]);

  const onRequestClose = () => {
    setDropAddress('');
    setPointsRequired('');
    setRequestHost('');
    setConfirmationOverlayShow(false);
  };

  return (
    <Container>
      {loading && <LoadingOverlay title="Processing verification..." />}
      {confirmationOverlayShow && (
        <ConfirmationOverlay
          onClose={() => {
            onRequestClose();
          }}
          host={requestHost}
          points={availablePoints}
          pointsRequired={Number(pointsRequired)}
          dropAddress={dropAddress}
        />
      )}

      {/* {!confirmationOverlayShow && timerOverlayShow && scheduledTime && (
        <ScheduleOverlay
          onClose={() => {
            setScheduledTime(null);
            setTimerOverlayShow(false);
          }}
          scheduledTime={scheduledTime}
        />
      )} */}

      <Header points={availablePoints} address={user.address} />

      {renderContent(user.key, availableTasks, verifications, navigate)}
    </Container>
  );
};

export default Home;
