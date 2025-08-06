import {AtLeastOne} from "../../common/types";

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type UrlPattern = `https://${string}`;
export type TargetRequest = {
    method: HttpMethod;
    urlPattern: UrlPattern;
}

export type RequestBodyHandlerData = {
    requestId: string;
    url: string;
    method: string;
    query: Record<string, string>;
    body?: chrome.webRequest.WebRequestBody | null;
    timestamp: number;
}

export type RequestHeadersHandlerData = {
    requestId: string;
    headers: Record<string, string>;
    cookies: Record<string, string>;
}

export type PartialRequestLog = AtLeastOne<RequestHeadersHandlerData, RequestBodyHandlerData>;
export type RequestLog = RequestBodyHandlerData & RequestHeadersHandlerData;
