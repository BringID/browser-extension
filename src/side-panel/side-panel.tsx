import React, { FC, useEffect } from 'react';
import browser from 'webextension-polyfill';
import { notarizationManager } from './services/notarization';
import { sendMessage } from '../common/core';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import { tasks } from '../common/core';
import {
  Container,
  LogoWrapperStyled,
  Header,
  TitleStyled,
  Content,
  Wrapper,
  NoteStyled,
} from './styled-components';
import { Page } from '../components';

const SidePanel: FC = () => {
  useEffect(() => {
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.type) {
        case 'VERIFICATION_START':
          void notarizationManager.run(0);
          break;
        case 'NOTARIZE':
          void notarizationManager.run(request.task_id);
          break;

        default:
          console.log({ request });
      }
    });
  }, []);

  const { result, taskId, progress } = useSelector((state: RootState) => {
    return state.notarization;
  });

  const availableTasks = tasks();

  const currentTask = availableTasks[taskId];

  useEffect(() => {
    if (!result) {
      return;
    }

    const credentialGroupId = currentTask.credentialGroupId;

    // @ts-ignore
    chrome.action.openPopup();
    window.setTimeout(() => {
      sendMessage({
        type: 'PRESENTATION',
        data: {
          presentationData: result,
          credentialGroupId,
        },
      });

      window.close();
    }, 2000);
  }, [result]);

  return (
    <Page>
      <Container>
        <Header>
          <LogoWrapperStyled icon={currentTask?.icon} />

          <TitleStyled>{currentTask?.description}</TitleStyled>
        </Header>

        <Content>
          <NoteStyled title="Processing notarization. Please wait...">
            progress: {progress}
          </NoteStyled>
        </Content>
      </Container>
    </Page>
  );
};

export default SidePanel;
