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
import { Page, Step } from '../components';
import './style.css';
import { TMessage } from '../common/core/messages';

const SidePanel: FC = () => {
  useEffect(() => {
    const listener = (request: TMessage) => {
      switch (request.type) {
        case 'NOTARIZE':
          if ('task_id' in request) {
            void notarizationManager.run(request.task_id);
          }
          break;

        case 'SIDE_PANEL_CLOSE':
          if (window.location.href.includes('sidePanel.html')) {
            window.close();
          }
          break;

        default:
          console.log({ request });
      }
    };

    browser.runtime.onMessage.addListener(listener);

    return () => {
      browser.runtime.onMessage.removeListener(listener);
    };
  }, []);

  const { result, taskId, progress, currentStep, transcriptRecv, error } =
    useSelector((state: RootState) => {
      return state.notarization;
    });

  const availableTasks = tasks();
  console.log({ taskId });
  const currentTask = availableTasks[taskId];

  // const credentialGroupId = currentTask.credentialGroupId;
  console.log('SIDE PANEL steps: ', { currentStep });

  return (
    <Wrapper>
      <Page>
        <Container>
          <Header>
            <LogoWrapperStyled icon={currentTask?.icon} />

            <TitleStyled>{currentTask?.description}</TitleStyled>
          </Header>

          <Content>
            {currentTask.steps.map((step, idx) => {
              return (
                <Step
                  {...step}
                  idx={idx}
                  key={step.text}
                  currentStep={currentStep}
                  progress={progress}
                  onClick={
                    step.notarization
                      ? () => {
                          if (!result || !transcriptRecv) {
                            return alert(
                              'Presentation data or transcriptRecv not defined',
                            );
                          }
                          // @ts-ignore
                          // chrome.action.openPopup();

                          chrome.runtime.sendMessage({ action: 'openPopup' });

                          window.setTimeout(() => {
                            sendMessage({
                              type: 'PRESENTATION',
                              data: {
                                presentationData: result,
                                transcriptRecv,
                                taskIndex: taskId,
                              },
                            });
                          }, 1500);
                        }
                      : undefined
                  }
                />
              );
            })}

            {error && <NoteStyled status="error">{error.message}</NoteStyled>}
          </Content>
        </Container>
      </Page>
    </Wrapper>
  );
};

export default SidePanel;
