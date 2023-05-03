import {RuntimeError} from '@bases/core/errors';
import {assertInstanceOf, isInstanceOf} from '@bases/core/utils';

export class RequestCancelledError extends RuntimeError {}

export const isRequestCancelledError = isInstanceOf(RequestCancelledError);
export const assertRequestCancelledError: (error: unknown) => asserts error is RequestCancelledError =
  assertInstanceOf(RequestCancelledError);
