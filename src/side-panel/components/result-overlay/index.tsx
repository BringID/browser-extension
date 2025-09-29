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
  Header
} from './styled-components'
import TProps from './types'
import { requestHostPermission, checkIfPermissionGranted } from '../../utils';
import { tasks } from '../../../common/core';

const defineButtons = (
  permissionUrl: string[],
  loading: boolean,
  setLoading: (loading: boolean) => void,
  onAccepted: () => void
) => {
  return <ButtonsContainer>
    <ButtonStyled onClick={async () => {
      setLoading(true)
      const requested = await requestHostPermission(permissionUrl)
      if (!requested) {
        setLoading(false)
        window.close()
        return alert('Permission denied')
      }
      setLoading(false)
      onAccepted()
    }} appearance="action" loading={loading}>
      Authorize MPC-TLS Session
    </ButtonStyled>

    <ButtonStyled onClick={() => {
      window.close()
    }}>
      Cancel
    </ButtonStyled>

  </ButtonsContainer>
};

const PermissionOverlay: FC<TProps> = ({
  nextTaskIndex,
  onAccepted
}) => {
  const [loading, setLoading] = useState<boolean>(false);

    const availableTasks = tasks();
    const currentTask = availableTasks[nextTaskIndex];


  useEffect(() => {
    (async () => {
      const granted = await checkIfPermissionGranted(currentTask.permissionUrl)
      if (granted) {
        onAccepted()
      }
    })()
  }, [

  ])

  return (
    <Container>
      <Header>
        <TitleStyled>{currentTask.title}</TitleStyled>
      </Header>
      <Content>

        <TextStyled>
          Private & Secure
        </TextStyled>

      </Content>
    </Container>
  );
};

export default PermissionOverlay;
