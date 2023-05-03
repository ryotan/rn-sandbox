import type {AxiosError, AxiosRequestConfig, AxiosResponse} from 'axios';
import Axios from 'axios';
import {applicationName, nativeApplicationVersion} from 'expo-application';
import {Platform} from 'react-native';

import {RequestCancelledError} from './RequestCancelledError';
import {RequestTimeoutError} from './RequestTimeoutError';

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
  let timerId: NodeJS.Timeout;
  let timeoutAbort = false;
  if (config.signal == null) {
    // Cannot use "AbortSignal.timeout" because it is not supported by React Native (Hermes).
    const controller = new AbortController();
    timerId = setTimeout(() => {
      controller.abort();
      timeoutAbort = true;
    }, timeout);
    config.signal = controller.signal;
  }

  return AXIOS_INSTANCE<ResponseBody>(config)
    .catch(error => {
      if (Axios.isCancel(error)) {
        if (timeoutAbort) {
          throw new RequestTimeoutError(
            `The request has been cancelled due to a timeout. ${parameters(config, timeout)}`,
            error,
            'RequestTimeoutError',
          );
        } else {
          throw new RequestCancelledError(
            `The request has been cancelled by the client. ${parameters(config, timeout)}`,
            error,
            'RequestCancelledError',
          );
        }
      }
      throw error;
    })
    .finally(() => clearTimeout(timerId));
};

const parameters = (config: AxiosRequestConfig, timeout: number) =>
  `method=[${String(config.method)}] url=[${String(config.url)}] timeout=[${timeout}ms]`;
