import React, { FC, useState, useEffect } from 'react';
import {
  Container,
  SubtitleStyled,
  ButtonStyled,
  MessageStyled,
  VerificationsListStyled,
} from './styled-components';
import { Link } from '../../../components';
import { Header } from '../../components';
import { useNavigate } from 'react-router';
import { useVerifications } from '../../store/reducers/verifications';
import { tasks } from '../../../common/core/task';
import {
  ScheduleOverlay,
  ConfirmationOverlay,
  LoadingOverlay,
} from '../../components';
import { calculateAvailablePoints, defineUserStatus } from '../../utils';
import configs from '../../configs';
import { useUser } from '../../store/reducers/user';

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
  const leftForAdvanced = configs.ADVANCED_STATUS_POINTS - availablePoints;
  const percentageFinished =
    (availablePoints / configs.ADVANCED_STATUS_POINTS) * 100;

  const userStatus = defineUserStatus(availablePoints);

  const navigate = useNavigate();
  const user = useUser()

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
      {loading && <LoadingOverlay />}
      {confirmationOverlayShow && (
        <ConfirmationOverlay
          onClose={() => {
            onRequestClose();
          }}
          host={requestHost}
          points={availablePoints}
          userStatus={userStatus}
          pointsRequired={Number(pointsRequired)}
          dropAddress={dropAddress}
        />
      )}

      {!confirmationOverlayShow && timerOverlayShow && scheduledTime && (
        <ScheduleOverlay
          onClose={() => {
            setScheduledTime(null);
            setTimerOverlayShow(false);
          }}
          scheduledTime={scheduledTime}
        />
      )}

      <Header
        status={userStatus}
        points={availablePoints}
        address={user.address}
      />

      {/* <ProgressBarStyled
        current={percentageFinished > 100 ? 100 : percentageFinished}
        max={100}
        title={`${leftForAdvanced < 0 ? 0 : leftForAdvanced} points more to Advanced`}
        value={`${Math.round(percentageFinished > 100 ? 100 : percentageFinished)}%`}
      /> */}

      <SubtitleStyled>
        {verifications && verifications.length > 0 && (
          <ButtonStyled
            size="small"
            onClick={() => {
              navigate('/tasks');
            }}
          >
            + Add
          </ButtonStyled>
        )}
      </SubtitleStyled>

      {verifications && verifications.length > 0 && (
        <MessageStyled>
          Verifications are batched for better privacy.{' '}
          <Link href="#">Learn more</Link>
        </MessageStyled>
      )}

      <VerificationsListStyled
        tasks={availableTasks}
        verifications={verifications}
        onAddVerifications={() => {
          navigate('/tasks');
        }}
      />
    </Container>
  );
};

export default Home;
