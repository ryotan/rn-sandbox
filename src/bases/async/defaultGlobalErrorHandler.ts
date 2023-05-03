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
 * * Rename outDebugLog to logErrorDetails.
 * * Change the unexpected error message.
 *
 * These modifications are provided under the CC0-1.0 license, which can be reviewed at the following URL:
 * https://creativecommons.org/publicdomain/zero/1.0/deed.en
 */
import type {QueryClient} from '@tanstack/react-query';
import type {AxiosError} from 'axios';
import {isAxiosError} from 'axios';
import {Alert} from 'react-native';

import {handleError, isApplicationError, RuntimeError} from '@bases/core/errors';
import {isRequestCancelledError, isRequestTimeoutError} from '@bases/http-client';
import {log} from '@bases/logging';
import {m} from '@bases/message';
import {Snackbar} from '@bases/ui/snackbar';

import type {QueryManipulator} from './TanstackQueryClientProvider';

export const defaultGlobalErrorHandler = (queryClient: QueryClient, onUnauthorized: QueryManipulator) => {
  return (error: unknown) => {
    logErrorDetails(error);
    if (
      // ApplicationErrorは呼出し元で処理する規約なので、ここでは特に処理を実施しない
      isApplicationError(error) ||
      // Timeout以外の理由でcancelされた場合 (cancelQueries呼び出し時など)は、ユーザへの通知も障害通知も不要なのでここでは特に処理を実施しない
      isRequestCancelledError(error)
    ) {
      // do nothing
    } else if (isAxiosError(error)) {
      handleAxiosError(error, queryClient, onUnauthorized);
    } else if (isRequestTimeoutError(error)) {
      // 時間をおいてから再操作をするように促すスナックバーを表示
      Snackbar.show(m('fw.error.リクエストタイムアウト'));
    } else {
      // 想定外のエラーが発生したことを伝えるスナックバーを表示し、Firebase Crashlyticsへログを送信
      Snackbar.show(m('fw.error.想定外エラー'));
      handleError(error);
    }
  };
};

const handleAxiosError = (error: AxiosError, queryClient: QueryClient, onUnauthorized: QueryManipulator) => {
  const statusCode = error.response?.status;
  switch (statusCode) {
    case 400: // Bad Request
      // デフォルトの動作としては特に処理を実施しない
      break;
    case 401: // Unauthorized
      // 401応答が返ってきて、自動セッション更新にも失敗したケース
      // 再ログインを促すアラートを表示
      onUnauthorized(queryClient);
      break;
    case 403: // Forbidden
      // 暫定的に最新の利用規約への同意が必要なことを伝えるアラートのみ表示
      // TODO: 最新の利用規約同意画面を開けるようにする
      Alert.alert(m('fw.error.利用規約未同意タイトル'), m('fw.error.利用規約未同意本文'));
      break;
    case 404: // Not Found
      // デフォルトの動作としては特に処理を実施しない
      break;
    case 412: // Precondition Failed
      // アプリを新しいバージョンにアップデートするように促すダイアログを表示
      // TODO: ダイアログからApp Storeを開けるようにする
      Alert.alert(m('fw.error.アプリバージョンエラータイトル'), m('fw.error.アプリバージョンエラー本文'));
      break;
    case 429: // Too Many Requests
      // 時間をおいてから再操作をするように促すスナックバーを表示
      Snackbar.show(m('fw.error.リクエスト過多'));
      break;
    case 503: // Service Unavailable
      // システムメンテナンス中であることを伝えるスナックバーを表示
      Snackbar.show(m('fw.error.システムメンテナンス'));
      break;
    case 504: // Gateway Timeout
      // 時間をおいてから再操作をするように促すスナックバーを表示
      Snackbar.show(m('fw.error.リクエストタイムアウト'));
      break;
    default:
      // 想定外のエラーが発生したことを伝えるスナックバーを表示し、Firebase Crashlyticsへログを送信
      Snackbar.show(m('fw.error.予期せぬ通信エラー'));
      handleError(error);
      break;
  }
};

const logErrorDetails = (error: unknown) => {
  try {
    if (isAxiosError(error)) {
      log.debug(buildAxiosErrorDetailedMessage(error));
    } else {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log.debug(`UnexpectedError: message=[${errorMessage}]`);
    }
  } catch (e) {
    log.error(new RuntimeError('Failed to log error details', e));
  }
};

const buildAxiosErrorDetailedMessage = (error: AxiosError) => {
  return `Backend API Request Error:
  req.url=[${error.config?.url ?? ''}]
  req.method=[${error.config?.method ?? ''}]
  req.headers=[${JSON.stringify(error.config?.headers, null, 2)}]
  req.body=[${JSON.stringify(error.config?.data, null, 2)}]
  res.status=[${error.response?.status ?? ''}]
  res.statusText=[${error.response?.statusText ?? ''}]
  res.headers=[${JSON.stringify(error.response?.headers, null, 2)}]
  res.body=[${JSON.stringify(error.response?.data, null, 2)}]
`;
};
