import {ApplicationError, isApplicationError} from './ApplicationError';
import {ErrorWithErrorCode} from './ErrorWithErrorCode';

class ApplicationErrorSubClass extends ApplicationError {}
class SomeError extends ErrorWithErrorCode {}

describe('isApplicationError', () => {
  it('should return false if null', () => {
    expect(isApplicationError(null)).toBe(false);
  });
  it('should return false if undefined', () => {
    expect(isApplicationError(undefined)).toBe(false);
  });
  it('should return false if object but not instance of ApplicationError', () => {
    expect(isApplicationError({})).toBe(false);
  });
  it('should return true if ApplicationError', () => {
    expect(isApplicationError(new ApplicationError())).toBe(true);
  });
  it('should return true if sub class of ApplicationError', () => {
    expect(isApplicationError(new ApplicationErrorSubClass())).toBe(true);
  });
  it('should return false if another sub class of ErrorWithErrorCode', () => {
    expect(isApplicationError(new SomeError())).toBe(false);
  });
});
