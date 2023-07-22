import {AxiosError, AxiosHeaders, CanceledError} from 'axios';

import {RuntimeError} from '@bases/core/errors';
import {log} from '@bases/logging';

import {handleError} from './handleError';

describe('handleError', () => {
  it.each([
    [
      new AxiosError('message', 'E_CODE', undefined, undefined, {
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {
          headers: new AxiosHeaders(),
        },
        data: {
          code: 'ErrorCodeInResponse',
        },
      }),
      'ErrorCodeInResponse',
    ],
    [new AxiosError(), 'AxiosError'],
    [new CanceledError(), 'CanceledError'],
    [new RuntimeError(), 'RuntimeError'],
    [new RuntimeError('message', 'ErrorCodeInRuntimeError'), 'ErrorCodeInRuntimeError'],
  ])('should call log.error with error and error code, if received error', (error, code) => {
    const spy = jest.spyOn(log, 'error').mockImplementation(() => log);
    try {
      handleError(error);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(error, code);
    } finally {
      spy.mockReset();
    }
  });

  it.each([['string'], [1]])('should call log.error with RuntimeError if received non-error object', thrown => {
    const spy = jest.spyOn(log, 'error').mockImplementation(() => log);
    try {
      handleError(thrown);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(new RuntimeError(thrown), 'ThrownObjectIsNotError');
    } finally {
      spy.mockReset();
    }
  });
});
