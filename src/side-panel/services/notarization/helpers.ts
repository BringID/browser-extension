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
  url?: string | ((request: Request) => string);
  headers?: {
    custom?: Record<string, string>;
    whitelist?: Array<string>;
    blacklist?: Array<string>;
    cookie?: {
      whitelist?: Array<string>;
      blacklist?: Array<string>;
    };
  };
  customBody?: JsonValue;
};

function applyLists(
  entries: Array<[string, string]>,
  whitelist?: string[],
  blacklist?: string[],
): Array<[string, string]> {
  let filtered: Array<[string, string]> = entries;
  if (whitelist && whitelist.length > 0) {
    const lowerWhitelist = whitelist.map((k) => k.toLowerCase());
    filtered = entries.filter(([key]) =>
      lowerWhitelist.includes(key.toLowerCase()),
    );
  }
  if (blacklist && blacklist.length > 0) {
    const lowerBlacklist = blacklist.map((k) => k.toLowerCase());
    filtered = filtered.filter(
      ([key]) => !lowerBlacklist.includes(key.toLowerCase()),
    );
  }
  return filtered;
}

export function replayRequest(req: Request, cfg: ReplayRequestConfig): Request {
  const headers = Object.fromEntries(
    applyLists(
      Object.entries(req.headers),
      cfg.headers?.whitelist,
      cfg.headers?.blacklist,
    ),
  );

  let url: string = req.url;
  if (typeof cfg.url == 'string') {
    url = cfg.url;
  } else if (cfg.url) {
    url = cfg.url(req);
  }

  const cookies = cookiesFromRequest(req, cfg.headers?.cookie);
  const finalHeaders = {
    ...headers,
    Cookie: cookies,
    ...cfg.headers?.custom,
  };

  console.log('[replayRequest] Original request headers:', req.headers);
  console.log('[replayRequest] Filtered headers:', headers);
  console.log('[replayRequest] Cookies being sent:', cookies);
  console.log('[replayRequest] Final headers:', finalHeaders);

  return {
    url,
    method: req.method,
    headers: finalHeaders,
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
  // Handle case-insensitive Cookie header lookup
  const cookieKey = Object.keys(req.headers).find(
    (k) => k.toLowerCase() === 'cookie',
  );
  const cookie = cookieKey ? req.headers[cookieKey] : undefined;
  if (!cookie) {
    console.log('[cookiesFromRequest] No cookie header found in request');
    return '';
  }

  let entries = cookie
    .split(';')
    .map((x) => x.trim())
    .filter(Boolean) // removes empty
    .map((part) => {
      const [k, ...rest] = part.split('=');
      const v = rest.join('='); // keeps values with "="
      return [k, v] as [string, string];
    });

  if (cfg) entries = applyLists(entries, cfg.whitelist, cfg.blacklist);
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
