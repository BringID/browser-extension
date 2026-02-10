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
  if (whitelist) {
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

  const rawRecv = Buffer.from(transcript.recv);
  const bodyStr = message.body.toString();
  console.log('[newCommitForRequest] transcript.recv total bytes:', transcript.recv.length);
  console.log('[newCommitForRequest] body length:', bodyStr.length);
  console.log('[newCommitForRequest] parsed info line:', message.info);

  if (bodyStr.length === 0) {
    console.error('[newCommitForRequest] Response body is empty (Content-Length: 0).', {
      recvBytes: transcript.recv.length,
      info: message.info,
      headers: message.headers,
    });
    return new Error(
      `Server returned an empty response body (HTTP status: ${message.info.trim()}). The request may be missing required headers or authentication.`
    );
  }

  let pointers: Pointers;
  try {
    pointers = parse(bodyStr).pointers;
  } catch (err) {
    console.error('[newCommitForRequest] Failed to parse response body as JSON.', {
      recvBytes: transcript.recv.length,
      bodyLength: bodyStr.length,
      bodyTail: bodyStr.slice(-200),
      error: err,
    });
    return new Error(
      `Response body is not valid JSON (recv: ${transcript.recv.length} bytes, body: ${bodyStr.length} bytes). Response may be truncated — try increasing maxRecvData.`
    );
  }

  // Find where the HTTP body area starts in the raw transcript (after \r\n\r\n).
  // We search for disclosure substrings directly in the raw buffer instead of
  // using arithmetic offsets, which breaks with Transfer-Encoding: chunked.
  const headersEndMarker = Buffer.from('\r\n\r\n');
  const headersEndPos = rawRecv.indexOf(headersEndMarker);
  if (headersEndPos === -1) {
    return new Error('Could not find end of HTTP headers in transcript');
  }
  const bodyAreaStart = headersEndPos + 4;

  for (const path of disclose) {
    const p: Mapping | undefined = pointers[path];
    if (!p || !p.key?.pos) {
      console.warn(`[newCommitForRequest] Skipping missing path: ${path}`);
      continue;
    }

    // Extract the disclosure substring from the decoded body and convert to bytes.
    const disclosureStr = bodyStr.substring(p.key.pos, p.valueEnd.pos);
    const disclosureBytes = Buffer.from(disclosureStr, 'utf-8');

    // Use the json-source-map character offset to compute a minimum search
    // position. This prevents matching an earlier duplicate (e.g. two
    // subscriptions both having "status":"Active").
    const searchFrom = bodyAreaStart + Buffer.byteLength(bodyStr.substring(0, p.key.pos), 'utf-8');

    // Find the exact byte sequence in the raw transcript (after headers).
    // This correctly handles chunked Transfer-Encoding since chunk size
    // markers (hex + \r\n) won't match JSON key-value content.
    const pos = rawRecv.indexOf(disclosureBytes, searchFrom);
    if (pos === -1) {
      return new Error(
        `Could not locate disclosed data for path '${path}' in raw transcript`,
      );
    }

    console.log(`[newCommitForRequest] Disclosed '${path}': "${disclosureStr}" at bytes [${pos}, ${pos + disclosureBytes.length}]`);
    commit.recv.push({
      start: pos,
      end: pos + disclosureBytes.length,
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
