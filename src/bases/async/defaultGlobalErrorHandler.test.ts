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
 * * Polish test code.
 *
 * These modifications are provided under the CC0-1.0 license, which can be reviewed at the following URL:
 * https://creativecommons.org/publicdomain/zero/1.0/deed.en
 */
import {QueryClient} from '@tanstack/react-query';
import {AxiosError, AxiosHeaders} from 'axios';
import {Alert} from 'react-native';

import {ApplicationError, RuntimeError, setHandleError} from '@bases/core/errors';
import {log} from '@bases/logging';
import {loadBundledMessages} from '@bases/message';
import {Snackbar} from '@bases/ui/snackbar';

import {defaultGlobalErrorHandler} from './defaultGlobalErrorHandler';

jest.mock('@bases/logging');

jest.useFakeTimers();

beforeAll(async () => {
  await loadBundledMessages();
});

setHandleError(jest.fn());

describe('defaultGlobalErrorHandler', () => {
  const spyAlert = jest.spyOn(Alert, 'alert');
  const spySnackbar = jest.spyOn(Snackbar, 'show').mockImplementation(() => {});
  const onUnauthorized = jest.fn();

  const queryClient = new QueryClient();
  const errorHandler = defaultGlobalErrorHandler(queryClient, onUnauthorized);

  test('400 Bad Requestの場合に何も行われない', () => {
    errorHandler(createAxiosErrorForTest(400));
    expect(spyAlert).not.toHaveBeenCalled();
    expect(spySnackbar).not.toHaveBeenCalled();
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  test('401 Unauthorizedの場合にはコールバックを呼び出す', () => {
    errorHandler(createAxiosErrorForTest(401));
    expect(spyAlert).not.toHaveBeenCalled();
    expect(spySnackbar).not.toHaveBeenCalled();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(onUnauthorized).toHaveBeenCalledWith(queryClient);
  });

  test('403 Forbiddenの場合に最新の利用規約への同意が必要なことを伝えるアラートを表示', () => {
    errorHandler(createAxiosErrorForTest(403));
    expect(spyAlert).toHaveBeenCalledTimes(1);
    expect(spyAlert).toHaveBeenCalledWith(
      '新しい利用規約への同意',
      'この機能を利用するためには最新の利用規約への同意が必要です。',
    );
    expect(spySnackbar).not.toHaveBeenCalled();
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  test('404 Not Foundの場合に何も行われない', () => {
    errorHandler(createAxiosErrorForTest(404));
    expect(spyAlert).not.toHaveBeenCalled();
    expect(spySnackbar).not.toHaveBeenCalled();
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  test('412 Precondition Failedの場合にアプリを新しいバージョンにアップデートするように促すダイアログを表示', () => {
    errorHandler(createAxiosErrorForTest(412));
    expect(spyAlert).toHaveBeenCalledTimes(1);
    expect(spyAlert).toHaveBeenCalledWith(
      'アプリの更新が必要です',
      'アプリのバージョンが古いためこの機能を利用できません。ストアからアップデートを実施してください。',
    );
    expect(spySnackbar).not.toHaveBeenCalled();
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  test('429 Too Many Requestsの場合に時間をおいてから再操作をするように促すスナックバーを表示', () => {
    errorHandler(createAxiosErrorForTest(429));
    expect(spyAlert).not.toHaveBeenCalled();
    expect(spySnackbar).toHaveBeenCalledTimes(1);
    expect(spySnackbar).toHaveBeenCalledWith(
      'ただいまリクエストが集中しており混雑しております。時間をおいてから再度お試しください。',
    );
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  test('503 Service Unavailableの場合にシステムメンテナンス中であることを伝えるスナックバーを表示', () => {
    errorHandler(createAxiosErrorForTest(503));
    expect(spyAlert).not.toHaveBeenCalled();
    expect(spySnackbar).toHaveBeenCalledTimes(1);
    expect(spySnackbar).toHaveBeenCalledWith(
      'ただいまシステムメンテナンスを実施しております。時間をおいてから再度お試しください。',
    );
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  test('504 SGateway Timeoutの場合に時間をおいてから再操作をするように促すスナックバーを表示', () => {
    errorHandler(createAxiosErrorForTest(504));
    expect(spyAlert).not.toHaveBeenCalled();
    expect(spySnackbar).toHaveBeenCalledTimes(1);
    expect(spySnackbar).toHaveBeenCalledWith(
      'サーバへの接続がタイムアウトしました。時間をおいてから再度お試しください。',
    );
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  test('500 Internal Server Errorの場合に予期せぬエラーのスナックバーを表示', () => {
    errorHandler(createAxiosErrorForTest(500));
    expect(spyAlert).not.toHaveBeenCalled();
    expect(spySnackbar).toHaveBeenCalledTimes(1);
    expect(spySnackbar).toHaveBeenCalledWith(
      '予期せぬ通信エラーが発生しました。時間をおいてから再度お試しいただき、解決しない場合はお問い合わせください。',
    );
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  test('nullの場合に予期せぬエラーのスナックバーを表示', () => {
    errorHandler(null);
    expect(spyAlert).not.toHaveBeenCalled();
    expect(spySnackbar).toHaveBeenCalledTimes(1);
    expect(spySnackbar).toHaveBeenCalledWith(
      'エラーが発生しました。時間をおいてから再度お試しいただき、解決しない場合はお問い合わせください。',
    );
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  test('undefinedの場合に予期せぬエラーのスナックバーを表示', () => {
    errorHandler(undefined);
    expect(spyAlert).not.toHaveBeenCalled();
    expect(spySnackbar).toHaveBeenCalledTimes(1);
    expect(spySnackbar).toHaveBeenCalledWith(
      'エラーが発生しました。時間をおいてから再度お試しいただき、解決しない場合はお問い合わせください。',
    );
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  test('ApplicationErrorは処理しないこと', () => {
    errorHandler(new ApplicationError(''));
    expect(spyAlert).not.toHaveBeenCalled();
    expect(spySnackbar).not.toHaveBeenCalled();
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  test('ログ出力に失敗しても何もスローされないこと', () => {
    const spyLogDebug = jest.spyOn(log, 'debug').mockImplementation(() => {
      throw new Error('log.debug');
    });
    const spyLogError = jest.spyOn(log, 'error');
    errorHandler(createAxiosErrorForTest(500));
    expect(spyLogDebug).toHaveBeenCalledTimes(1);
    expect(spyLogError).toHaveBeenCalledTimes(1);
    expect(spyLogError).toHaveBeenCalledWith(new RuntimeError('Failed to log error details'));
  });
});

const createAxiosErrorForTest = (status: number) => {
  return new AxiosError(undefined, undefined, undefined, undefined, {
    status,
    statusText: '',
    data: {},
    headers: {},
    config: {headers: new AxiosHeaders()},
  });
};
