import { Result, TTask } from '../../../common/types';
import {
  OnStateUpdated,
  State as ProgressiveState,
} from '../../common/helpers/progressive';
import { Commit, Presentation } from 'bringid-tlsn-js';
import { Request } from '../../common/types';
import { Transcript } from '../tlsn/types';
import { ParsedHTTPMessage } from '../../common/helpers/httpParser';
import { TargetRequest } from '../requests-recorder/types';
import { newRequestMiddleware, ReplayRequestConfig, RequestHandler } from './helpers';
import { JsonValue } from 'type-fest';
export enum NotarizationStatus {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  Completed = 'Completed',
  Stopped = 'Stopped',
}

export type ResultCallback = (presentation: Result<Presentation>) => void;

export type NotarizationHandler = {
  task: TTask;
  state: ProgressiveState<NotarizationStatus>;
  start: (
    resultCallback: ResultCallback,
    updatesCallback?: OnStateUpdated<NotarizationStatus>,
    currentStepUpdateCallback?: (currentStep: number) => void,
  ) => Promise<void>;
  stop: () => Promise<void>;
};

// Callbacks

export type ResponseMiddleware = (
  requests: Array<Request>,
  responseJSON: JsonValue,
) => Promise<Result<void>>;

export type TranscriptMiddleware = (
  requests: Array<Request>,
  transcript: Transcript,
  message: ParsedHTTPMessage,
) => Promise<Result<Commit>>;

// Handler configs

export type HandlerConfigBase = {
  name: string;
  redirect: string;
  tlsnConfig: TLSNConfig;
};

export type HandlerConfig = HandlerConfigBase & {
  requests: TargetRequest[];
  requestMiddleware?: RequestHandler;
  responseMiddleware?: ResponseMiddleware;
  transcriptMiddleware: TranscriptMiddleware;
};

export type SimpleHandlerConfig = HandlerConfigBase & {
  request: TargetRequest;
  replayRequestCfg: ReplayRequestConfig;
  responseMiddleware?: ResponseMiddleware;
  transcriptDisclose: string[];
};

export function isSimpleHandlerConfig(
  cfg: HandlerConfig | SimpleHandlerConfig,
): cfg is SimpleHandlerConfig {
  return (
    'request' in cfg && 'replayRequestCfg' in cfg && 'transcriptDisclose' in cfg
  );
}

// Other

export type TLSNConfig = {
  serverDns: string;
  maxSentData?: number;
  maxRecvData?: number;
};
