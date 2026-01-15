import React, { FC, useEffect, useState } from 'react';
import browser from 'webextension-polyfill';
import { notarizationManager } from './services/notarization';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
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
  NoteAdditionalInfoStyled,
  DownloadLogs
} from './styled-components';
import { useDispatch } from 'react-redux';
import { notarizationSlice } from './store/notarization';
import { Page, Step } from '../components';
import './style.css';
import { TMessage } from '../common/core/messages';
import config from '../configs';
import {
  PermissionOverlay,
  ResultOverlay,
  TaskLoader,
  ScheduleOverlay,
} from './components';
import { TConnectionQuality, TTask } from '../common/types';
import errors from '../configs/errors';
import { defineGroup } from '../common/utils';
import manager from '../manager';
import { collectLogs, formatCapturedLogs, downloadDataAsFile } from './utils';

const buffer = collectLogs(entry => {
  console.debug('Captured:', entry);
});

const renderAdditionalInformation = (
  currentStep: number, // starts with 0

  additionalInfo?: {
    title: string;
    text: string;
    showBeforeStep?: number;
  },
  error?: string | null,
) => {
  if (!additionalInfo || error) {
    return null;
  }

  const {
    showBeforeStep, // if set to 2 it means that should be visible on step 0 and 1
    title,
    text,
  } = additionalInfo;

  if (showBeforeStep !== undefined) {
    if (currentStep >= showBeforeStep) {
      return null;
    }
  }

  return (
    <NoteAdditionalInfoStyled status="warning" title={additionalInfo.title}>
      {additionalInfo.text}
    </NoteAdditionalInfoStyled>
  );
};

const renderButtons = (
  retryTask: () => Promise<void>,
  sendResult: () => void,
  progress: number,
  copyStarted: boolean,
  setCopyStarted: (copyStarted: boolean) => void,
  error?: string | null,
  result?: string,
) => {
  if (!error && !result) {
    return (
      <Buttons>
        <ButtonStyled
          disabled={Boolean(!result || error)}
          onClick={sendResult}
          appearance="action"
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
    );
  }

  return (
    <Buttons>
      {!error && (
        <ButtonStyled onClick={sendResult} appearance="action">
          Continue
        </ButtonStyled>
      )}
      <ButtonStyled
        onClick={() => {
          window.close();
        }}
      >
        Close
      </ButtonStyled>
    </Buttons>
  );
};

const renderHeader = (
  taskId: number,
  currentTask: TTask,
  error?: string | null,
) => {
  if (error) {
    const currentTaskErrors = errors.notarization[taskId];

    // if no task or no error for task found
    if (!currentTaskErrors || !currentTaskErrors[error]) {
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
        <LogoWrapperStyled icon={currentTask?.icon} status="error" />

        <TitleStyled>Account Not Eligible</TitleStyled>

        <TextStyled>
          Your account doesn’t meet the requirements for verification.
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
  taskId: number,
  currentTask: TTask,
  currentStep: number,
  progress: number,
  result?: string,
  connectionQuality?: TConnectionQuality,
  speed?: string,
  eta?: number,
  error?: string | null,
) => {
  if (error) {
    const currentTaskErrors = errors.notarization[taskId];

    if (!currentTaskErrors || !currentTaskErrors[error]) {
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
            <DownloadLogs
              onClick={async () => {
                const formatBuffer = formatCapturedLogs(buffer)
                downloadDataAsFile(
                  formatBuffer,
                  'logs.json'
                )
              }}
            >
              Download error logs
            </DownloadLogs>
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

    return (
      <>
        <NoteStyled status="error" title="Reason:">
          {currentTaskErrors[error]}
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
        result={result}
        key={step.text}
        currentStep={currentStep}
        progress={step.notarization ? progress : undefined}
        connectionQuality={connectionQuality}
        speed={speed}
        eta={eta}
      />
    );
  });
};

const SidePanel: FC = () => {
  const dispatch = useDispatch();
  const [showPermissionOverlay, setShowPermissionOverlay] =
    useState<boolean>(false);

  const [showResultOverlay, setShowResultOverlay] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [copyStarted, setCopyStarted] = useState<boolean>(false);

  useEffect(() => {
    const listener = (request: TMessage) => {
      switch (request.type) {
        case 'NOTARIZE':
          if ('task' in request) {
            dispatch(notarizationSlice.actions.clear());
            dispatch(notarizationSlice.actions.setTask(JSON.parse(request.task)))
            setShowPermissionOverlay(true);
            window.focus();
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

  const {
    result,
    taskId,
    progress,
    currentStep,
    transcriptRecv,
    error,
    eta,
    connectionQuality,
    speed,
    transcriptSent,
    task
  } = useSelector((state: RootState) => {
    return state.notarization;
  });

  console.log({ task })

  const [scheduledTime, setScheduledTime] = useState<number | null>(null);

  if (taskId === null) {
    return (
      <Wrapper>
        <Page>
          {showPermissionOverlay && task && (
            <PermissionOverlay
              currentTask={task}
              onAccepted={() => {
                setShowPermissionOverlay(false);
                notarizationManager.run(0);
              }}
            />
          )}

          <TaskLoader
            onStart={() => {
              chrome.storage.local.get(['task'], (data) => {
                if (!data || data.task === undefined) {
                  alert('No task found');
                  return;
                }

                console.log('TaskLoader onStart', { task })


                dispatch(notarizationSlice.actions.setTask(JSON.parse(data.task)))


                // chrome.storage.local.remove('task');
                setShowPermissionOverlay(true);
              });
            }}
          />
        </Page>
      </Wrapper>
    );
  }

  // const credentialGroupId = currentTask.credentialGroupId;

  return (
    <Wrapper>
      <Page>
        {showResultOverlay && task && (
          <ResultOverlay
            loading={loading}
            title={task.service}
            onAccept={async () => {
              setLoading(true);
              try {
                chrome.tabs.query({}, (tabs) => {
                  for (const tab of tabs) {
                    if (!tab.id) continue;
                    chrome.tabs.sendMessage(tab.id as number, {
                      type: 'VERIFICATION_DATA_READY',
                      payload: {
                        transcriptRecv,
                        presentationData: result
                      },
                    });
                  }
                });

                
                
                setShowResultOverlay(false);
              } catch (err) {
                console.log('ERROR: ', err);
              }
              setLoading(false);
            }}
            onReject={() => {
              setShowResultOverlay(false);
            }}
            transcriptRecv={transcriptRecv as string}
            transcriptSent={transcriptSent as string}
          />
        )}

        {scheduledTime && (
          <ScheduleOverlay
            onClose={() => {
              window.close();
            }}
            onAction={() => {
              window.close()
              
              chrome.action
                // @ts-ignore
                .openPopup()
                // @ts-ignore
                .catch((err) => {
                  console.error('Failed to open popup:', err);
                });
            }}
            scheduledTime={scheduledTime}
          />
        )}

        <Container>
          {task && renderHeader(taskId, task, error)}

          {task && renderAdditionalInformation(
            currentStep,
            task.additionalInfo,
            error,
          )}

          <Content>
            {task && renderContent(
              taskId,
              task,
              currentStep,
              progress,
              result,
              connectionQuality,
              speed,
              eta,
              error,
            )}

            {renderButtons(
              async () => {
                dispatch(notarizationSlice.actions.clear());
                void notarizationManager.run(taskId);
              },

              () => {
                if (!result || !transcriptRecv || !transcriptSent) {
                  return alert(
                    'Presentation data or transcriptRecv not defined',
                  );
                }

                setShowResultOverlay(true);
              },
              progress,
              copyStarted,
              setCopyStarted,
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
