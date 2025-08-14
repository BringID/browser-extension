import { HTTPParser, ParserType } from 'http-parser-js';
import { Result } from '../../../common/types';

export type ParsedHTTPMessage = {
  headers: string[];
  body: Buffer;
  info: string
};

export function parseHttpMessage(
  buffer: Buffer,
  parserType: ParserType,
): Result<ParsedHTTPMessage> {
  let complete = false;
  const body: Buffer[] = [];
  const parsed: ParsedHTTPMessage = {
    headers: [],
    body: Buffer.alloc(0),
    info: buffer.toString('utf-8').split('\r\n')[0] + '\r\n'
  };

  const parser = new HTTPParser(parserType);
  parser.onBody = (t) => body.push(t);
  parser.onHeadersComplete = (res) => {
    parsed.headers = res.headers;
  };
  parser.onMessageComplete = () => {
    complete = true;
  };

  parser.execute(buffer);
  if (parser.finish() instanceof Error)
    return Error('Failed to parse HTTP message');
  if (!complete) return Error('Failed to parse HTTP message');

  parsed.body = Buffer.concat(body);
  return parsed;
}
