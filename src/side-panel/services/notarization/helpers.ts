import { Request } from '../../common/types';
import { Commit } from 'bringid-tlsn-js';
import { Mapping, parse, Pointers } from 'json-source-map';
import { Transcript } from '../tlsn/types';
import { ParsedHTTPMessage } from '../../common/helpers/httpParser';
import { Result } from '../../../common/types';
import { JsonValue } from 'type-fest';
import { TranscriptMiddleware } from './types';

export type RequestHandler = (
  requests: Array<Request>,
) => Promise<Result<Request>>;

export type ReplayRequestConfig = {
  headers?: {
    custom?: Record<string, string>;
    cookie?: {
      whitelist?: Array<string>;
      blacklist?: Array<string>;
    };
  };
  customBody?: JsonValue;
};

// @ts-ignore
export function replayRequest(req: Request, cfg: ReplayRequestConfig): Request {
  return {
    url: req.url,
    method: req.method,
    headers: {
      ...cfg.headers?.custom,
      Cookie: cookiesFromRequest(req, cfg.headers?.cookie),
    },
    body: cfg.customBody || req.body,
  };
}

export function cookiesFromRequest(
  req: Request,
  cfg?: {
    whitelist?: Array<string>;
    blacklist?: Array<string>;
  },
): string {
  const cookie = req.headers['Cookie'];
  if (!cookie) return '';

  let entries = cookie
    .split(';')
    .map((x) => x.trim())
    .filter(Boolean) // removes empty
    .map((part) => {
      const [k, ...rest] = part.split('=');
      const v = rest.join('='); // keeps values with "="
      return [k, v] as [string, string];
    });

  if (cfg) {
    if (cfg.whitelist && cfg.whitelist.length > 0) {
      const wl = cfg.whitelist;
      entries = entries.filter(([key]) => wl.includes(key));
    }

    if (cfg.blacklist && cfg.blacklist.length > 0) {
      const bl = cfg.blacklist;
      entries = entries.filter(([key]) => !bl.includes(key));
    }
  }
  return entries.map(([k, v]) => `${k}=${v}`).join(';');
}

export function newCommitForRequest(
  req: Request,
  transcript: Transcript,
  message: ParsedHTTPMessage,
  disclose: Array<string>,
): Result<Commit> {
  const sentEnd = `${req.method} ${req.url}`.length;
  const commit: Commit = {
    sent: [{ start: 0, end: sentEnd }],
    recv: [],
  };
  const transcriptJsonStr = Buffer.from(transcript.recv).toString('utf-8');
  const jsonStarts: number = transcriptJsonStr.indexOf('\n{') + 1;
  const pointers: Pointers = parse(message.body.toString()).pointers;

  for (const path of disclose) {
    const p: Mapping = pointers[path];
    if (!p.key?.pos) {
      return new Error('required_data_not_found');
    }
    // Needed for properly UTF-8 symbols processing in Verifier.
    const dataLength = Buffer.from(
      message.body.toString().substring(p.key?.pos, p.valueEnd.pos),
      'utf-8',
    ).length;
    commit.recv.push({
      start: jsonStarts + p.key?.pos,
      end: jsonStarts + p.key?.pos + dataLength,
    });
  }
  return commit;
}

export function newRequestMiddleware(
  requestId: number,
  replayRequestCfg: ReplayRequestConfig,
): RequestHandler {
  return async (requests: Array<Request>) => {
    if (requests.length <= requestId) {
      console.log("That's what we have:", requests.length, requestId);
      return Error('handler panic: wrong request handler configuration');
    }
    return replayRequest(requests[requestId], replayRequestCfg);
  };
}

export function newTranscriptMiddleware(
  requestId: number,
  transcriptDisclose: Array<string>,
): TranscriptMiddleware {
  return async (
    requests: Array<Request>,
    transcript: Transcript,
    message: ParsedHTTPMessage,
  ) => {
    if (requests.length <= requestId) {
      return Error('handler panic: wrong transcript handler configuration');
    }
    return newCommitForRequest(
      requests[requestId],
      transcript,
      message,
      transcriptDisclose,
    );
  };
}
