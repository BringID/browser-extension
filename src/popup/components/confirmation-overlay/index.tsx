import React, { FC, useState, useMemo, useEffect } from 'react';
import {
  Container,
  LogoWrapperStyled,
  TitleStyled,
  Content,
  ButtonsContainer,
  Image,
  ButtonStyled,
} from './styled-components';
import TProps from './types';
import { useVerifications } from '../../store/reducers/verifications';
import BringGif from '../../../images/bring.gif';
import { useUser } from '../../store/reducers/user';
import { getCurrentTab } from '../../../common/utils';
import manager from '../../../manager';
import { TTask } from '../../../common/types';

const defineDeclineButton = (
  onClose: () => void,
  origin: string,
  tabId: number | null,
  requestId: string
) => {
  return (
    <ButtonStyled
      size="default"
      onClick={async () => {
        try {
          if (tabId) {
            chrome.tabs.sendMessage(tabId, {
              type: 'VERIFICATION_DATA_ERROR',
              payload: {
                error: 'USER_DECLINED_ZK_TLS_VERIFICATION',
                requestId,
                origin
              }
            });
          } else {
            console.error('No tabId found');
          }

          onClose();
          window.close();
        } catch (err) {
          console.log({ err });
        }
      }}
    >
      DECLINE
    </ButtonStyled>
  );
};

const defineButton = (
  onClose: () => void,
  task: string,
  origin: string,
  tabId: number | null,
  requestId: string
) => {
  
  return (
    <ButtonStyled
      size="default"
      appearance="action"
      onClick={async () => {
        try {
          const tab = await getCurrentTab();

          if (tab) {
            chrome.storage.local.set({
              task,
              requestMeta: {
                requestId,
                tabId,
                origin
              }
            }, async () => {
            // @ts-ignore
              chrome.sidePanel.open({
                tabId: tab.id,
              });
              await manager.runTask(task);
            });

          setTimeout(() => {
            window.close();
            onClose();
          }, 1500);
          }
          

        } catch (err) {
          console.log({ err });
        }
      }}
    >
      START
    </ButtonStyled>
  )
};

const ConfirmationOverlay: FC<TProps> = ({
  onClose,
  task,
  origin,
  tabId,
  requestId
}) => {

  const taskObj = JSON.parse(task) as TTask

  return (
    <Container>
      <Content>
        <LogoWrapperStyled icon={<Image src={BringGif} />} />
        <TitleStyled>Run ZKTLS verification for {taskObj.title}</TitleStyled>

        <ButtonsContainer>
          {defineButton(
            onClose,
            task,
            origin,
            tabId,
            requestId
          )}
          {defineDeclineButton(
            onClose,
            origin,
            tabId,
            requestId
          )}
        </ButtonsContainer>
      </Content>
    </Container>
  );
};

export default ConfirmationOverlay;
