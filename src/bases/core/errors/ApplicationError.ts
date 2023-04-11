import {ErrorWithErrorCode} from './ErrorWithErrorCode';

export class ApplicationError extends ErrorWithErrorCode {}

export function isApplicationError(error?: unknown): error is ApplicationError {
  return error != null && typeof error === 'object' && error instanceof ApplicationError;
}
