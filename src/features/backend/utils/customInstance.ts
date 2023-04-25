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
import type {AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';
import Axios from 'axios';
import {applicationName, nativeApplicationVersion} from 'expo-application';
import {Platform} from 'react-native';

import {RequestTimeoutError} from '../errors/RequestTimeoutError';

export type ErrorType<Error> = AxiosError<Error>;

const REQUEST_TIMEOUT = 60000;

const backendUrl = 'http://localhost:9090/api';
const BACKEND_AXIOS_INSTANCE = Axios.create({baseURL: backendUrl});

const getUserAgent = () => {
  const appName = applicationName ?? 'unknown';
  const appVersion = nativeApplicationVersion ?? 'unknown';
  const platform = Platform.OS;
  const platformVersion = Platform.Version;
  return `${appName}/${appVersion} (${platform}/${platformVersion})`;
};

const getDefaultAxiosConfig = (): AxiosRequestConfig => {
  return {
    headers: {
      Accept: 'application/json',
      'User-Agent': getUserAgent(),
    },
  };
};

const customInstance = <T>(
  axiosInstance: AxiosInstance,
): ((config: AxiosRequestConfig) => Promise<AxiosResponse<T>>) => {
  const defaultAxiosConfig = getDefaultAxiosConfig();
  return (config: AxiosRequestConfig) => {
    // TODO: React Native / Expo のバージョンアップ時にJestを27以降にバージョンアップできたらCancelTokenからAbortControllerへ移行する
    const source = Axios.CancelToken.source();
    const requestConfig = {
      ...defaultAxiosConfig,
      ...config,
      cancelToken: source.token,
    };
    const promise = axiosInstance(requestConfig);

    // @ts-ignore
    promise.cancel = () => {
      source.cancel('Query was cancelled by React Query');
    };

    let timeoutId: NodeJS.Timeout | null;
    if (REQUEST_TIMEOUT) {
      timeoutId = setTimeout(() => {
        timeoutId = null;
        source.cancel('Query was cancelled by Request Timeout');
      }, REQUEST_TIMEOUT);
    }

    return promise
      .catch(error => {
        // TODO: AbortControllerへの移行時に処理を見直す
        // AbortControllerでabortした場合はErrorにはならず、responseがundefinedになる
        if (Axios.isCancel(error)) {
          const cancelError = error as {message: string};
          if (cancelError.message === 'Query was cancelled by Request Timeout') {
            throw new RequestTimeoutError('Request Timeout');
          }
        }
        throw error;
      })
      .finally(() => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      });
  };
};

export const backendCustomInstance = <T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
  return customInstance<T>(BACKEND_AXIOS_INSTANCE)(config);
};
