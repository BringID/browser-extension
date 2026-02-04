import React, { FC, useEffect, useState, useRef } from 'react';
import browser from 'webextension-polyfill';
import { initNotarizationManager, getNotarizationManager } from '../../services/notarization';
import { NotarizationManager } from '../../services/notarization/notarization-manager';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  NoteStyled,
  ListStyled,
  NoteAdditionalInfoStyled,
  DownloadLogs
} from './styled-components'

import {
  Container,
  LogoWrapperStyled,
  Header,
  TitleStyled,
  Content,
  Wrapper,
  ButtonStyled,
  Buttons,
  LinkStyled,
  TextStyled
} from '../styled-components'

import { useDispatch } from 'react-redux';
import { notarizationSlice } from '../../store/notarization';
import { Page, Step } from '../../../components';
import '../../style.css';
import { TMessage } from '../../../common/core/messages';
import config from '../../../configs';
import {
  PermissionOverlay,
  ResultOverlay,
  TaskLoader,
  ScheduleOverlay,
} from '../../components'
import { TConnectionQuality, TNotarizationError, TTask } from '../../../common/types'
import errors from '../../../configs/errors';
import { collectLogs, formatCapturedLogs, downloadDataAsFile } from '../../utils';

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
  error?: TNotarizationError | null,
) => {
  if (error) {
    const currentTaskErrors = errors.notarization;

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
  error?: TNotarizationError | null,
) => {
  if (error) {
    const currentTaskErrors = errors.notarization;

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

const TaskVerification: FC = () => {
  const dispatch = useDispatch();
  const [showPermissionOverlay, setShowPermissionOverlay] =
    useState<boolean>(false);

  const [showResultOverlay, setShowResultOverlay] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [copyStarted, setCopyStarted] = useState<boolean>(false);
  const [notarizationManager, setNotarizationManager] = useState<NotarizationManager | null>(null);

  const tabIdRef = useRef<number | null>(null);
  const requestIdRef = useRef<string | null>(null);
  const originRef = useRef<string | null>(null);
  const portRef = useRef<chrome.runtime.Port | null>(null);

  // Establish port connection on mount
  useEffect(() => {
    const port = chrome.runtime.connect({ name: 'side-panel' });
    portRef.current = port;
    console.log('Side panel connected to background');

    return () => {
      // Port will auto-disconnect when component unmounts or window closes
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
    task,
    origin,
    tabId,
    requestId
  } = useSelector((state: RootState) => {
    return state.notarization;
  });

  useEffect(() => {
    tabIdRef.current = tabId;
    requestIdRef.current = requestId;
    originRef.current = origin;

    // Register session with background when we have all info
    if (tabId && requestId && portRef.current) {
      portRef.current.postMessage({
        type: 'REGISTER_SESSION',
        tabId,
        requestId,
        origin
      });
      console.log('Session registered with background');
    }
  }, [tabId, requestId, origin]);


  const [scheduledTime, setScheduledTime] = useState<number | null>(null);

  if (taskId === null) {
    return (
      <Wrapper>
        <Page>
          {showPermissionOverlay && task && notarizationManager && (
            <PermissionOverlay
              currentTask={task}
              onAccepted={() => {
                setShowPermissionOverlay(false);
                notarizationManager.run(0);
              }}
            />
          )}

            <TaskLoader
              onStart={async () => {
                chrome.storage.local.get(['task', 'requestMeta'], async (data) => {
                  console.log('TaskLoader onStart', { data });
                  if (!data || data.task === undefined) {
                    alert('No task found');
                    return;
                  }

                  console.log('TaskLoader onStart', { task, data });

                  dispatch(notarizationSlice.actions.setTask(JSON.parse(data.task)));

                  if (!data.requestMeta) {
                    alert('No task requestMeta found');
                    return;
                  }
                  dispatch(notarizationSlice.actions.setOrigin(data.requestMeta.origin));
                  dispatch(notarizationSlice.actions.setTabId(data.requestMeta.tabId));
                  dispatch(notarizationSlice.actions.setRequestId(data.requestMeta.requestId));

                  // Initialize notarization manager with the task from storage
                  const manager = await initNotarizationManager();
                  setNotarizationManager(manager);

                  setShowPermissionOverlay(true);
                });
              }}
            />
        </Page>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Page>
        {showResultOverlay && task && (
          <ResultOverlay
            loading={loading}
            title={task.service}
            onAccept={async () => {
              setLoading(true);
              if (tabId) {

                try {
                  // Unregister session so disconnect doesn't send cancellation
                  chrome.runtime.sendMessage({ type: 'UNREGISTER_SESSION', requestId });

                  chrome.tabs.sendMessage(tabId, {
                    type: 'VERIFICATION_DATA_READY',
                    payload: {
                      transcriptRecv,
                      presentationData: result,
                      requestId,
                      origin
                    },
                  });
                  chrome.storage.local.remove(['task', 'requestMeta']);
                  window.close()
                  setShowResultOverlay(false);
                } catch (err) {
                  // Unregister session so disconnect doesn't send duplicate cancellation
                  chrome.runtime.sendMessage({ type: 'UNREGISTER_SESSION', requestId });

                  chrome.tabs.sendMessage(tabId, {
                    type: 'VERIFICATION_DATA_ERROR',
                    payload: {
                      error: 'VERIFICATION_FAILED',
                      requestId,
                      origin
                    }
                  });
                  chrome.storage.local.remove(['task', 'requestMeta']);
                  console.log('ERROR: ', err);
                  setShowResultOverlay(false)
                  window.close()
                }
              } else {
                console.error('No tabId found in requestMeta');
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
                const manager = getNotarizationManager();
                if (manager) {
                  void manager.run(taskId);
                }
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

export default TaskVerification;
