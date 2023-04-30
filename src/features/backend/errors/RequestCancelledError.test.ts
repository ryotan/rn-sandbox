import {RuntimeError} from '@bases/core/errors';
import {AssertionError} from '@bases/core/utils';

import {RequestCancelledError, assertRequestCancelledError, isRequestCancelledError} from './RequestCancelledError';

class RequestCancelledErrorSubClass extends RequestCancelledError {}
class SomeError extends RuntimeError {}

describe('isRequestCancelledError', () => {
  it.each([[null], [undefined], [{}], [new SomeError()]])('should return false if arg=[%s]', arg => {
    expect(isRequestCancelledError(arg)).toBe(false);
    expect(() => assertRequestCancelledError(arg)).toThrow(AssertionError);
  });

  it.each([[new RequestCancelledError()], [new RequestCancelledErrorSubClass()]])(
    'should return true if arg=[%s]',
    arg => {
      expect(isRequestCancelledError(arg)).toBe(true);
      expect(() => assertRequestCancelledError(arg)).not.toThrow(AssertionError);
    },
  );
});
