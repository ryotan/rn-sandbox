import type {AxiosError, AxiosRequestConfig, AxiosResponse} from 'axios';
import Axios from 'axios';
import {applicationName, nativeApplicationVersion} from 'expo-application';
import {Platform} from 'react-native';

import {RequestCancelledError} from '../errors/RequestCancelledError';

export type ErrorType<ErrorResponseBody> = AxiosError<ErrorResponseBody> | RequestCancelledError;

const REQUEST_TIMEOUT = 60000;

const baseURL = 'http://localhost:9090/api';
const headers = {
  Accept: 'application/json',
  'User-Agent': `${String(applicationName)}/${String(nativeApplicationVersion)} (${Platform.OS} ${Platform.Version})`,
};
const AXIOS_INSTANCE = Axios.create({baseURL, headers});

export const httpCall = <ResponseBody>(config: AxiosRequestConfig): Promise<AxiosResponse<ResponseBody>> => {
  const timeout = config.timeout ?? REQUEST_TIMEOUT;
  const requestConfig = {
    signal: AbortSignal.timeout(timeout),
    ...config,
  };
  const promise = AXIOS_INSTANCE<ResponseBody>(requestConfig);

  return promise.catch(error => {
    if (Axios.isCancel(error)) {
      throw new RequestCancelledError(
        `The request has been cancelled due to a timeout or has been aborted by client.` +
          ` method=[${String(requestConfig.method)}] url=[${String(requestConfig.url)}] timeout=[${timeout}ms]`,
        error,
        'RequestCancelledError',
      );
    }
    throw error;
  });
};
