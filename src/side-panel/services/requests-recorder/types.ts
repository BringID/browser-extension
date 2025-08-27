import { AtLeastOne, HttpMethod } from '../../common/types';

export enum Status {
  Idle = 'idle',
  Recording = 'recording',
  Stopped = 'stopped',
}

export type UrlPattern = `https://${string}`;
export type TargetRequest = {
  method: HttpMethod;
  urlPattern: UrlPattern;
};

export type RequestBodyHandlerData = {
  requestId: string;
  url: string;
  method: string;
  query: Record<string, string>;
  body?: chrome.webRequest.WebRequestBody | null;
  timestamp: number;
};

export type RequestHeadersHandlerData = {
  requestId: string;
  headers: Record<string, string>;
};

export type PartialRequestLog = AtLeastOne<
  RequestHeadersHandlerData,
  RequestBodyHandlerData
>;
export type RequestLog = RequestBodyHandlerData & RequestHeadersHandlerData;
