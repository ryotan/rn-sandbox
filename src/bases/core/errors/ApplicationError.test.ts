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
