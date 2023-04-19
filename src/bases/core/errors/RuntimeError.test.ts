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
import {AssertionError} from '@bases/core/utils';

import {ErrorWithErrorCode} from './ErrorWithErrorCode';
import {RuntimeError, assertRuntimeError, isRuntimeError} from './RuntimeError';

class RuntimeErrorSubClass extends RuntimeError {}
class SomeError extends ErrorWithErrorCode {}

describe('isRuntimeError', () => {
  it.each([[null], [undefined], [{}], [new SomeError()]])('should return false if arg=[%s]', arg => {
    expect(isRuntimeError(arg)).toBe(false);
    expect(() => assertRuntimeError(arg)).toThrow(AssertionError);
  });

  it.each([[new RuntimeError()], [new RuntimeErrorSubClass()]])('should return true if arg=[%s]', arg => {
    expect(isRuntimeError(arg)).toBe(true);
    expect(() => assertRuntimeError(arg)).not.toThrow(AssertionError);
  });
});
