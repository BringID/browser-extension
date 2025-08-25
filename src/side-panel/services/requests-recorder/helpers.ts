import { RequestLog } from './types';
import { Request } from '../../common/types';
import { toHttpMethod } from '../../common/guards';
import { Result } from '../../../common/types';
import { JsonValue } from 'type-fest';

function webRequestBodyToJson(
  body?: chrome.webRequest.WebRequestBody | null,
): Result<JsonValue | undefined> {
  if (!body || (!body.formData && !body.raw)) {
    return undefined;
  }

  if (body.formData) {
    try {
      return JSON.stringify(body.formData);
    } catch (e) {
      return new Error('Failed to convert formData to JSON string');
    }
  }

  if (body.raw && body.raw.length > 0) {
    try {
      const combinedData = body.raw.reduce((acc, chunk) => {
        if (chunk.bytes) {
          const decoder = new TextDecoder('utf-8');
          return acc + decoder.decode(new Uint8Array(chunk.bytes));
        }
        if (chunk.file) {
          return acc + chunk.file;
        }
        return acc;
      }, '');

      JSON.parse(combinedData);
      return combinedData;
    } catch (e) {
      return new Error('Failed to convert raw data to valid JSON string');
    }
  }
  return new Error('WebRequestBody does not contain valid JSON data');
}

export function toRequest(requestLog: RequestLog): Result<Request> {
  if (!toHttpMethod(requestLog.method)) return new Error('Invalid HTTP method');

  const bodyParsed = webRequestBodyToJson(requestLog.body);
  if (bodyParsed instanceof Error) {
    console.log(6)
    return bodyParsed;
  }

  return {
    url: requestLog.url,
    method: requestLog.method,
    headers: requestLog.headers,
    body: bodyParsed,
  };
}
