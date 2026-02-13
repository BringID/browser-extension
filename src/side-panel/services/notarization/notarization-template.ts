import { NotarizationBase } from './notarization-base';
import { RequestRecorder } from '../requests-recorder';
import { TargetRequest } from '../requests-recorder/types';
import { Request } from '../../common/types';
import { TLSNotary } from '../tlsn';
import { Commit } from 'bringid-tlsn-js';
import { Result, TTask } from '../../../common/types';
import {
  newRequestMiddleware,
  newTranscriptMiddleware,
  RequestHandler,
} from './helpers';
import {
  HandlerConfig,
  isSimpleHandlerConfig,
  ResponseMiddleware,
  SimpleHandlerConfig,
  TranscriptMiddleware,
} from './types';

const DEFAULT_WS_MONITOR_CONFIG = {
  logEveryNMessages: 100,
  verbose: true,
  trackSize: true,
  expectedTotalBytes: 55000000 * 1.15,
  enableProgress: true,
  progressUpdateInterval: 500,
};

export class NotarizationTemplate extends NotarizationBase {
  name: string;
  requestRecorder?: RequestRecorder;
  redirect: string;
  tlsnConfig: {
    serverDns: string;
    maxSentData: number;
    maxRecvData: number;
  };
  transcriptMiddleware: TranscriptMiddleware;
  requestMiddleware?: RequestHandler;
  responseMiddleware?: ResponseMiddleware;

  constructor(cfg: HandlerConfig | SimpleHandlerConfig, task: TTask) {
    super(task);
    this.redirect = cfg.redirect;
    this.tlsnConfig = {
      maxSentData: 1500,
      maxRecvData: 1500,
      ...cfg.tlsnConfig,
    };

    let requests: TargetRequest[];
    if (isSimpleHandlerConfig(cfg)) {
      this.transcriptMiddleware = newTranscriptMiddleware(
        0,
        cfg.transcriptDisclose,
      );
      this.requestMiddleware = newRequestMiddleware(0, cfg.replayRequestCfg);
      requests = [cfg.request];
    } else {
      this.transcriptMiddleware = cfg.transcriptMiddleware;
      this.requestMiddleware = cfg.requestMiddleware;
      requests = cfg.requests;
    }

    this.responseMiddleware = cfg.responseMiddleware;
    this.name = cfg.name;
    this.requestRecorder = new RequestRecorder(
      requests,
      this.onRequestsCaptured.bind(this),
    );
  }

  async onStart(): Promise<void> {
    this.requestRecorder?.start();
    await chrome.tabs.create({
      url: this.redirect,
    });
    this.currentStep = 1;
    if (this.currentStepUpdateCallback)
      this.currentStepUpdateCallback(this.currentStep);
  }

  private async onRequestsCaptured(log: Array<Request>) {
    this.currentStep = 2;
    if (this.currentStepUpdateCallback)
      this.currentStepUpdateCallback(this.currentStep);

    let request: Result<Request> = {
      url: log[0].url,
      method: log[0].method,
      headers: { ...log[0].headers },
      body: log[0].body,
    };
    if (this.requestMiddleware) {
      request = await this.requestMiddleware(log);
      if (request instanceof Error) return this.result(request);
    }

    const response = await fetch(request.url, {
      ...request,
      body: JSON.stringify(request.body),
    });

    const responseText = await response.text();
    console.log(`[NotarizationTemplate] Fetch response size: ${responseText.length} bytes (maxRecvData: ${this.tlsnConfig.maxRecvData})`);

    let responseJSON: any;
    try {
      responseJSON = JSON.parse(responseText);
    } catch (err) {
      console.error('[NotarizationTemplate] Failed to parse fetch response as JSON:', {
        status: response.status,
        contentType: response.headers.get('content-type'),
        bodyPreview: responseText.substring(0, 500),
      });
      return this.result(new Error('Failed to parse API response as JSON'));
    }

    if (this.responseMiddleware) {
      const responseProcessed = await this.responseMiddleware(
        log,
        responseJSON,
      );
      if (responseProcessed instanceof Error) {
        return this.result(responseProcessed);
      }
    }

    // Notarization

    try {
      const notary = await TLSNotary.new(this.tlsnConfig, {
        ...DEFAULT_WS_MONITOR_CONFIG,
        logPrefix: `[WS Monitor / ${this.name}]`,
      });

      // Transcript
      const result = await notary.transcript(request);
      if (result instanceof Error) return this.result(result);
      const commit: Result<Commit> = await this.transcriptMiddleware(
        log,
        ...result,
      );
      if (commit instanceof Error) return this.result(commit);
      this.result(await notary.notarize(commit));
    } catch (err) {
      this.result(err as Error)
    }
  }

  public async onStop(): Promise<void> {
    if (this.requestRecorder) this.requestRecorder.stop();
  }
}
