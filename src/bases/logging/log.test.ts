import {RuntimeError} from '@bases/core/errors';
import {createLogger} from '@bases/logging/Logger';
import {log, setLogger} from '@bases/logging/log';

describe('setLogger', () => {
  it('should set global logger', () => {
    // noinspection UnnecessaryLocalVariableJS -- `log` is changed by setLogger globally...
    const original = log;
    try {
      const spy = jest.fn();
      // Use setLogger to
      setLogger(
        createLogger({
          level: 'trace',
          transports: [
            {error: spy, log: jest.fn(), trace: jest.fn(), debug: jest.fn(), info: jest.fn(), warn: jest.fn()},
          ],
        }),
      );
      log.error(new RuntimeError());
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(new RuntimeError(), 'UnexpectedError');
    } finally {
      setLogger(original);
    }
  });
});
