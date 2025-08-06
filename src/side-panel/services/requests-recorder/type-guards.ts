import {RequestLog, PartialRequestLog, HttpMethod} from "./types";

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
export function toHttpMethod(value: string): value is HttpMethod {
    return HTTP_METHODS.includes(value as HttpMethod);
}

const REQUEST_LOG_SCHEMA: Record<keyof RequestLog, 'required' | 'nullable' | 'optional'> = {
    requestId: 'required',
    url: 'required',
    method: 'required',
    headers: 'required',
    cookies: 'required',
    query: 'required',
    body: 'optional',
    timestamp: 'required',
};
export function toCompleteLog(log: PartialRequestLog): log is RequestLog {
    return (Object.keys(REQUEST_LOG_SCHEMA) as (keyof RequestLog)[])
        .every(key => {
            const value = log[key];
            switch (REQUEST_LOG_SCHEMA[key]) {
                case 'required':
                    return Boolean(value);
                case 'nullable':
                    return value !== undefined;
                case 'optional':
                    return true;
            }
        });
}