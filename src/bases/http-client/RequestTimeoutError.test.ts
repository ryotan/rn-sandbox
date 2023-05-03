import {RuntimeError} from '@bases/core/errors';
import {AssertionError} from '@bases/core/utils';

import {RequestTimeoutError, assertRequestTimeoutError, isRequestTimeoutError} from './RequestTimeoutError';

class RequestTimeoutErrorSubClass extends RequestTimeoutError {}
class SomeError extends RuntimeError {}

describe('isRequestTimeoutError', () => {
  it.each([[null], [undefined], [{}], [new SomeError()]])('should return false if arg=[%s]', arg => {
    expect(isRequestTimeoutError(arg)).toBe(false);
    expect(() => assertRequestTimeoutError(arg)).toThrow(AssertionError);
  });

  it.each([[new RequestTimeoutError()], [new RequestTimeoutErrorSubClass()]])('should return true if arg=[%s]', arg => {
    expect(isRequestTimeoutError(arg)).toBe(true);
    expect(() => assertRequestTimeoutError(arg)).not.toThrow(AssertionError);
  });
});
