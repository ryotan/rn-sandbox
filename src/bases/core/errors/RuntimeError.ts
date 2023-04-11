import {ErrorWithErrorCode} from './ErrorWithErrorCode';

export class RuntimeError extends ErrorWithErrorCode {}

export function isRuntimeError(error?: any): error is RuntimeError {
  return error != null && typeof error === 'object' && error instanceof RuntimeError;
}
