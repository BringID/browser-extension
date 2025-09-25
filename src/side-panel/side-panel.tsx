import React, { FC, useEffect } from 'react';
import browser from 'webextension-polyfill';
import { notarizationManager } from './services/notarization';
import { sendMessage, Task } from '../common/core';
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
  TextStyled,
  ListStyled,
  ButtonStyled,
  Buttons,
  LinkStyled,
} from './styled-components';
import { useDispatch } from 'react-redux';
import { notarizationSlice } from './store/notarization';
import { Page, Step } from '../components';
import './style.css';
import { TMessage } from '../common/core/messages';
import config from '../configs';

const renderButtons = (
  retryTask: () => Promise<void>,
  sendResult: () => void,
  progress: number,
  error?: string | null,
  result?: string,
) => {
  if (!error && !result) {
    return <Buttons>
      <ButtonStyled
        disabled={Boolean(!result || error)}
        onClick={sendResult}
        appearance='action'
      >
        Continue ({progress}%)
      </ButtonStyled>
      <ButtonStyled
        onClick={() => {
          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              if (tabs.length > 0) {
                if (tabs[0].id) {
                  chrome.tabs.remove(tabs[0].id);
                }
              }
            },
          );
          window.close();
        }}
      >
        Cancel verification
      </ButtonStyled>

    </Buttons>      
  }

  return (
    <Buttons>
      <ButtonStyled
        onClick={sendResult}
        appearance='action'
      >
        Continue
      </ButtonStyled>
      <ButtonStyled
        onClick={() => {
          window.close();
        }}
      >
        Close
      </ButtonStyled>
      {/* <ButtonStyled
      appearance='action'
      onClick={retryTask}
    >
      Try again
    </ButtonStyled>

    <ButtonStyled
      onClick={() => {
        chrome.runtime.sendMessage({ action: 'openPopup' });
      }}
    >
      Back to verifications
    </ButtonStyled> */}
    </Buttons>
  );
};

const renderHeader = (currentTask: Task, error?: string | null) => {
  if (error) {
    return (
      <Header>
        <LogoWrapperStyled icon={currentTask?.icon} status="error" />

        <TitleStyled>Verification Failed</TitleStyled>

        <TextStyled>
          Something went wrong during the MPC-TLS verification
        </TextStyled>
      </Header>
    );
  }

  return (
    <Header>
      <LogoWrapperStyled icon={currentTask?.icon} />

      <TitleStyled>{currentTask?.description}</TitleStyled>
    </Header>
  );
};

const renderContent = (
  currentTask: Task,
  currentStep: number,
  progress: number,
  error?: string | null
) => {
  if (error) {
    return (
      <>
        <NoteStyled status="error" title="Common issues:">
          <ListStyled
            items={[
              'Network connection problems',
              'Service temporarily unavailable',
              "Account doesn't meet verification requirements",
            ]}
          />
        </NoteStyled>

        <NoteStyled status="info" title="Need help?">
          If the error persists, ask for help in our{' '}
          <LinkStyled href={config.TELEGRAM_URL} target="_blank">
            Telegram community
          </LinkStyled>
        </NoteStyled>
      </>
    );
  }
  return currentTask.steps.map((step, idx) => {
    return (
      <Step
        {...step}
        idx={idx}
        key={step.text}
        currentStep={currentStep}
        progress={step.notarization ? progress : undefined}
        connectionQuality='poor'
        bandwidth={1000000}
        latency={35}
      />
    );
  });
};

const SidePanel: FC = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const listener = (request: TMessage) => {
      switch (request.type) {
        case 'NOTARIZE':
          if ('task_id' in request) {
            dispatch(notarizationSlice.actions.clear());
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

  console.log('DATA: ', {
    result,
    taskId,
    progress,
    currentStep,
    transcriptRecv,
    error,
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
          {renderHeader(currentTask, error)}

          <Content>
            {renderContent(
              currentTask,
              currentStep,
              progress,
              error
            )}

            {renderButtons(
              async () => {
                dispatch(notarizationSlice.actions.clear());
                void notarizationManager.run(taskId);
              },

              () => {
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
              },
              progress,
              error,
              result,
            )}
          </Content>
        </Container>
      </Page>
    </Wrapper>
  );
};

export default SidePanel;
