import {ErrorWithErrorCode} from './ErrorWithErrorCode';
import {RuntimeError, isRuntimeError} from './RuntimeError';

class RuntimeErrorSubClass extends RuntimeError {}
class SomeError extends ErrorWithErrorCode {}

describe('isRuntimeError', () => {
  it('should return false if null', () => {
    expect(isRuntimeError(null)).toBe(false);
  });
  it('should return false if undefined', () => {
    expect(isRuntimeError(undefined)).toBe(false);
  });
  it('should return false if object but not instance of RuntimeError', () => {
    expect(isRuntimeError({})).toBe(false);
  });
  it('should return true if RuntimeError', () => {
    expect(isRuntimeError(new RuntimeError())).toBe(true);
  });
  it('should return true if sub class of RuntimeError', () => {
    expect(isRuntimeError(new RuntimeErrorSubClass())).toBe(true);
  });
  it('should return false if another sub class of ErrorWithErrorCode', () => {
    expect(isRuntimeError(new SomeError())).toBe(false);
  });
});
