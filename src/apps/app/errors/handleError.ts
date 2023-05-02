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
 *
 * ------------------------------------------------------------
 *
 * The following changes have been made to the original source code:
 * * Use type guard function to check if the error has `code` or `errorCode` property.
 * * Use Error.name as the error code if the error does not have `code` or `errorCode` property.
 *
 * These modifications are provided under the CC0-1.0 license, which can be reviewed at the following URL:
 * https://creativecommons.org/publicdomain/zero/1.0/deed.en
 */
import {isAxiosError} from 'axios';

import {RuntimeError} from '@bases/core/errors';
import {hasStringProperty} from '@bases/core/utils';
import {log} from '@bases/logging';

const hasCode = hasStringProperty('code');
const hasErrorCode = hasStringProperty('errorCode');

export const handleError = (error: unknown) => {
  if (isAxiosError(error)) {
    const errorData: unknown = error.response?.data;
    const code = hasCode(errorData) ? errorData.code : error.name;
    log.error(error, code);
  } else if (error instanceof Error) {
    if (hasErrorCode(error)) {
      log.error(error, error.errorCode);
    } else {
      log.error(error, error.name);
    }
  } else {
    log.error(new RuntimeError(error), 'ThrownObjectIsNotError');
  }
};
