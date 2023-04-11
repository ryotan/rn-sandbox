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
