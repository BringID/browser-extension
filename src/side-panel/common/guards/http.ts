import { HttpMethod } from '../types';

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE'];
export function toHttpMethod(value: string): value is HttpMethod {
  return HTTP_METHODS.includes(value as HttpMethod);
}
