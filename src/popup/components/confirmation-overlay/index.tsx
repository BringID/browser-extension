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

const defineButton = (
  onClose: () => void,
  task: string
) => {
  
  return (
    <ButtonStyled
      size="default"
      appearance="action"
      onClick={async () => {
        try {
          const tab = await getCurrentTab();
          // if (tab) {
          //   chrome.tabs.sendMessage(tab.id as number, {
          //     type: TExtensionRequestType.proofs_generated,
          //     payload: {
          //       proofs,
          //       points: pointsSelected,
          //     },
          //   });
          // } else {
          //   alert('NO TAB DETECTED');
          // }

          if (tab) {
            chrome.storage.local.set({ task }, async () => {
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
  origin
}) => {


  return (
    <Container>
      <Content>
        <LogoWrapperStyled icon={<Image src={BringGif} />} />
        <TitleStyled>RUN VERIFICATION {task}</TitleStyled>

        <ButtonsContainer>
          {defineButton(
            onClose,
            task
          )}
        </ButtonsContainer>
      </Content>
    </Container>
  );
};

export default ConfirmationOverlay;
