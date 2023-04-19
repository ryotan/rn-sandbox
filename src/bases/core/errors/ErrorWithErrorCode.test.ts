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
import {ErrorWrapper} from '@bases/core/errors/ErrorWrapper';
import {AssertionError} from '@bases/core/utils';

import {assertErrorWithErrorCode, ErrorWithErrorCode, isErrorWithErrorCode} from './ErrorWithErrorCode';

class SomeError extends Error {}
const cause = new SomeError('root cause');

class ErrorWithErrorCodeSubClass extends ErrorWithErrorCode {}
const nested = new ErrorWithErrorCodeSubClass('nested cause', cause);

describe.each([
  [[] as const, {message: '', cause: undefined, errorCode: undefined}],
  [[cause] as const, {message: '', cause, errorCode: undefined}],
  [['message only'] as const, {message: 'message only', cause: undefined, errorCode: undefined}],
  [[cause, 'errorCode'] as const, {message: '', cause, errorCode: 'errorCode'}],
  [['some message', 'someErrorCode'] as const, {message: 'some message', cause: undefined, errorCode: 'someErrorCode'}],
  [
    ['some message', nested, 'someErrorCode'] as const,
    {message: 'some message', cause: nested, errorCode: 'someErrorCode'},
  ],
])('ErrorWithErrorCode', (args, expected) => {
  const sut =
    args.length === 0
      ? new ErrorWithErrorCode()
      : args.length === 1
      ? new ErrorWithErrorCode(args[0])
      : args.length === 2
      ? new ErrorWithErrorCode(args[0], args[1])
      : new ErrorWithErrorCode(...args);

  it('should be an instance of ErrorWrapper and name is ErrorWithErrorCode', () => {
    expect(sut).toBeInstanceOf(ErrorWrapper);
    expect(sut.name).toBe('ErrorWithErrorCode');
  });
  it('should have the expected message', () => {
    expect(sut.message).toBe(expected.message);
  });
  it('should have the expected cause', () => {
    expect(sut.cause).toBe(expected.cause);
  });
  it('should have the expected errorCode', () => {
    expect(sut.errorCode).toBe(expected.errorCode);
  });
});

describe('isErrorWithErrorCode', () => {
  it.each([[null], [undefined], [{}], [new SomeError()]])('should return false if arg=[%s]', arg => {
    expect(isErrorWithErrorCode(arg)).toBe(false);
    expect(() => assertErrorWithErrorCode(arg)).toThrow(AssertionError);
  });

  it.each([[new ErrorWithErrorCode()], [new ErrorWithErrorCodeSubClass()]])('should return true if arg=[%s]', arg => {
    expect(isErrorWithErrorCode(arg)).toBe(true);
    expect(() => assertErrorWithErrorCode(arg)).not.toThrow(AssertionError);
  });
});
