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
 * * Receive callback function of unauthorized error as an argument.
 *
 * These modifications are provided under the CC0-1.0 license, which can be reviewed at the following URL:
 * https://creativecommons.org/publicdomain/zero/1.0/deed.en
 */
import type {Query} from '@tanstack/react-query';
import {QueryClient} from '@tanstack/react-query';
import {AxiosError, AxiosHeaders} from 'axios';

import {setHandleError} from '@bases/core/errors';
import {loadBundledMessages} from '@bases/message';
import {Snackbar} from '@bases/ui/snackbar';

import {defaultGlobalQueryErrorHandler} from './defaultGlobalQueryErrorHandler';

jest.mock('@bases/logging');

jest.useFakeTimers();

beforeAll(async () => {
  await loadBundledMessages();
});

setHandleError(jest.fn());

describe('defaultGlobalQueryErrorHandler', () => {
  const query = {} as unknown as Query;
  const axiosError = new AxiosError(
    undefined,
    undefined,
    undefined,
    {},
    {
      status: 500,
      statusText: 'Internal Server Error',
      data: {message: 'message', code: 'errorCode'},
      headers: {},
      config: {
        headers: new AxiosHeaders(),
      },
    },
  );

  test('500 Internal Server Errorの場合に予期せぬエラーのスナックバーを表示', () => {
    const spySnackbar = jest.spyOn(Snackbar, 'show').mockImplementation(() => {});
    const onUnauthorized = jest.fn();
    const errorHandler = defaultGlobalQueryErrorHandler(new QueryClient(), onUnauthorized);
    expect(errorHandler).not.toBeUndefined();
    errorHandler(axiosError, query);
    expect(spySnackbar).toHaveBeenCalledWith(
      '予期せぬ通信エラーが発生しました。時間をおいてから再度お試しいただき、解決しない場合はお問い合わせください。',
    );
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  test('disableGlobalErrorHandlerが設定されている場合に何も行わない', () => {
    const spySnackbar = jest.spyOn(Snackbar, 'show').mockImplementation(() => {});
    const onUnauthorized = jest.fn();
    const query = {meta: {disableGlobalErrorHandler: true}} as unknown as Query;
    const errorHandler = defaultGlobalQueryErrorHandler(new QueryClient(), onUnauthorized);
    expect(errorHandler).not.toBeUndefined();
    errorHandler(axiosError, query);
    expect(spySnackbar).not.toHaveBeenCalled();
    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});
