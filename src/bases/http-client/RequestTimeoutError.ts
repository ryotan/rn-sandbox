import {RuntimeError} from '@bases/core/errors';
import {assertInstanceOf, isInstanceOf} from '@bases/core/utils';

export class RequestTimeoutError extends RuntimeError {}

export const isRequestTimeoutError = isInstanceOf(RequestTimeoutError);
export const assertRequestTimeoutError: (error: unknown) => asserts error is RequestTimeoutError =
  assertInstanceOf(RequestTimeoutError);
