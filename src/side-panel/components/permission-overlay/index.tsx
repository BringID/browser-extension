import React, { FC, useState, useMemo, useEffect } from 'react';
import {
  Container,
  LogoWrapperStyled,
  TitleStyled,
  Content,
  ButtonsContainer,
  TextStyled,
  Image,
  ButtonStyled,
  NoteStyled,
  LinkStyled,
  ListStyled,
} from './styled-components';
import TProps from './types';
import { requestHostPermission, checkIfPermissionGranted } from '../../utils';
import { tasks } from '../../../common/core';

const showNote = () => {
  return (
    <NoteStyled status="info">
      The TLS notary validates encrypted session integrity and generates a
      signed attestation without accessing decrypted content.{' '}
      <LinkStyled href="https://github.com/BringID/whitepaper" target="_blank">
        Learn more
      </LinkStyled>
    </NoteStyled>
  );
};

const defineButtons = (
  permissionUrl: string[],
  loading: boolean,
  setLoading: (loading: boolean) => void,
  onAccepted: () => void,
) => {
  return (
    <ButtonsContainer>
      <ButtonStyled
        onClick={async () => {
          setLoading(true);
          const requested = await requestHostPermission(permissionUrl);
          if (!requested) {
            setLoading(false);
            window.close();
            return alert('Permission denied');
          }
          setLoading(false);
          onAccepted();
        }}
        appearance="action"
        loading={loading}
      >
        Authorize MPC-TLS Session
      </ButtonStyled>

      <ButtonStyled
        onClick={() => {
          window.close();
        }}
      >
        Cancel
      </ButtonStyled>
    </ButtonsContainer>
  );
};

const PermissionOverlay: FC<TProps> = ({ nextTaskIndex, onAccepted }) => {
  const [loading, setLoading] = useState<boolean>(false);

  const availableTasks = tasks();
  const currentTask = availableTasks[nextTaskIndex];

  useEffect(() => {
    (async () => {
      const granted = await checkIfPermissionGranted(currentTask.permissionUrl);
      if (granted) {
        onAccepted();
      }
    })();
  }, []);

  return (
    <Container>
      <Content>
        <LogoWrapperStyled icon={<Image src={currentTask.icon} />} />
        <TitleStyled>{currentTask.title}</TitleStyled>

        <TextStyled>Private & Secure</TextStyled>

        <ListStyled
          items={[
            '✅ Your credentials remain private',
            '✅ Zero-knowledge verification',
            '❌ No data storage or logging',
          ]}
        />
        {showNote()}

        {defineButtons(
          currentTask.permissionUrl,
          loading,
          setLoading,
          onAccepted,
        )}
      </Content>
    </Container>
  );
};

export default PermissionOverlay;
