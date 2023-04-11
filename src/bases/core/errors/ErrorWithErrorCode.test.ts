/*
 * Copyright 2023 TIS Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {ErrorWithErrorCode, isErrorWithErrorCode} from './ErrorWithErrorCode';

class ErrorWithErrorCodeSubClass extends ErrorWithErrorCode {}

const cause = new ErrorWithErrorCodeSubClass('root cause');
const nested = new ErrorWithErrorCodeSubClass('nested cause', cause);

// eslint-disable-next-line jest/unbound-method
const captureStackTrace = Error.captureStackTrace;
describe.each([false, true])(
  'new ErrorWithErrorCode() when captureStackTrace availability is %p',
  captureStackTraceAvailable => {
    beforeAll(() => {
      if (!captureStackTraceAvailable) {
        // @ts-ignore
        delete Error.captureStackTrace;
      }
    });
    afterAll(() => {
      if (!captureStackTraceAvailable) {
        Error.captureStackTrace = captureStackTrace;
      }
    });

    it('given a message', () => {
      const message = 'error message';
      const sut = new ErrorWithErrorCode(message);

      expect(sut.name).toEqual('ErrorWithErrorCode');
      expect(sut.message).toEqual(message);
      expect(sut.cause).toEqual(undefined);
      expect(sut.stack).toMatch(/^ErrorWithErrorCode: error message$/m);
      expect(sut.errorCode).toEqual(undefined);
    });

    it('given an Error', () => {
      const sut = new ErrorWithErrorCode(cause);

      expect(sut.name).toEqual('ErrorWithErrorCode');
      expect(sut.message).toEqual('');
      expect(sut.cause).toEqual(cause);
      expect(sut.stack).toMatch(/^ErrorWithErrorCode: $.+^ErrorWithErrorCodeSubClass: root cause/ms);
      expect(sut.errorCode).toEqual(undefined);
    });

    it('given a message and errorCode', () => {
      const message = 'error message';
      const errorCode = 'error code';
      const sut = new ErrorWithErrorCode(message, errorCode);

      expect(sut.name).toEqual('ErrorWithErrorCode');
      expect(sut.message).toEqual(message);
      expect(sut.cause).toEqual(undefined);
      expect(sut.stack).toMatch(/^ErrorWithErrorCode: error message$/m);
      expect(sut.errorCode).toEqual(errorCode);
    });

    it('given an Error and errorCode', () => {
      const errorCode = 'error code';
      const sut = new ErrorWithErrorCode(cause, errorCode);

      expect(sut.name).toEqual('ErrorWithErrorCode');
      expect(sut.message).toEqual('');
      expect(sut.cause).toEqual(cause);
      expect(sut.stack).toMatch(/^ErrorWithErrorCode: $.+^ErrorWithErrorCodeSubClass: root cause/ms);
      expect(sut.errorCode).toEqual(errorCode);
    });

    it('given a message and Error', () => {
      const message = 'when the error occurred';
      const sut = new ErrorWithErrorCode(message, cause);

      expect(sut.name).toEqual('ErrorWithErrorCode');
      expect(sut.message).toEqual(message);
      expect(sut.cause).toEqual(cause);
      expect(sut.stack).toMatch(
        /^ErrorWithErrorCode: when the error occurred$.+^ErrorWithErrorCodeSubClass: root cause/ms,
      );
      expect(sut.errorCode).toEqual(undefined);
    });

    it('given a message and Error and errorCode', () => {
      const message = 'when the error occurred';
      const errorCode = 'error code';
      const sut = new ErrorWithErrorCode(message, cause, errorCode);

      expect(sut.name).toEqual('ErrorWithErrorCode');
      expect(sut.message).toEqual(message);
      expect(sut.cause).toEqual(cause);
      expect(sut.stack).toMatch(
        /^ErrorWithErrorCode: when the error occurred$.+^ErrorWithErrorCodeSubClass: root cause/ms,
      );
      expect(sut.errorCode).toEqual(errorCode);
    });

    it('given a message and nested Error', () => {
      const message = 'when the error occurred';
      const sut = new ErrorWithErrorCode(message, nested);

      expect(sut.message).toEqual(message);
      expect(sut.cause).toEqual(nested);
      expect(sut.stack?.match(/^\S/gm)?.length).toEqual(3);
      expect(sut.stack).toMatch(
        /^ErrorWithErrorCode: when the error occurred.+^ErrorWithErrorCodeSubClass: nested cause.+^ErrorWithErrorCodeSubClass: root cause/ms,
      );
      expect(sut.errorCode).toEqual(undefined);
    });

    it('given an argument other than message or cause', () => {
      const mock = jest.spyOn(console, 'warn').mockImplementation();
      try {
        // @ts-ignore
        const sut = new ErrorWithErrorCode(['array', {key: 'value'}]);

        expect(sut.name).toEqual('ErrorWithErrorCode');
        expect(sut.message).toEqual('');
        expect(sut.cause).toEqual(undefined);
        expect(sut.errorCode).toEqual(undefined);
      } finally {
        mock.mockRestore();
      }
    });

    it('given an argument other than Error', () => {
      const message = 'when the error occurred';
      const cause = {key: 'value'};
      // @ts-ignore
      const sut = new ErrorWithErrorCode(message, cause);

      expect(sut.message).toEqual(message);
      expect(sut.cause).toEqual(undefined);
      expect(sut.errorCode).toEqual(undefined);
    });
  },
);

describe('ErrorWithErrorCode', () => {
  it('sub class should be instance of ErrorWithErrorCode', () => {
    const sut = new ErrorWithErrorCodeSubClass();
    // noinspection SuspiciousTypeOfGuard
    expect(sut instanceof ErrorWithErrorCodeSubClass).toBe(true);
    // noinspection SuspiciousTypeOfGuard
    expect(sut instanceof ErrorWithErrorCode).toBe(true);
  });
});

class SomeError extends Error {}

describe('isErrorWithErrorCode', () => {
  it('should return false if null', () => {
    expect(isErrorWithErrorCode(null)).toBe(false);
  });
  it('should return false if undefined', () => {
    expect(isErrorWithErrorCode(undefined)).toBe(false);
  });
  it('should return false if object but not instance of ErrorWithErrorCode', () => {
    expect(isErrorWithErrorCode({})).toBe(false);
  });
  it('should return true if ErrorWithErrorCode', () => {
    expect(isErrorWithErrorCode(new ErrorWithErrorCode())).toBe(true);
  });
  it('should return true if sub class of ErrorWithErrorCode', () => {
    expect(isErrorWithErrorCode(new ErrorWithErrorCodeSubClass())).toBe(true);
  });
  it('should return false if another sub class of Error', () => {
    expect(isErrorWithErrorCode(new SomeError())).toBe(false);
  });
});
