import { RequestLog, PartialRequestLog } from './types';

const REQUEST_LOG_SCHEMA: Record<
  keyof RequestLog,
  'required' | 'nullable' | 'optional'
> = {
  requestId: 'required',
  url: 'required',
  method: 'required',
  headers: 'required',
  query: 'required',
  body: 'optional',
  timestamp: 'required',
};
export function toCompleteLog(log: PartialRequestLog): log is RequestLog {
  return (Object.keys(REQUEST_LOG_SCHEMA) as (keyof RequestLog)[]).every(
    (key) => {
      const value = log[key];
      switch (REQUEST_LOG_SCHEMA[key]) {
        case 'required':
          return Boolean(value);
        case 'nullable':
          return value !== undefined;
        case 'optional':
          return true;
      }
    },
  );
}
