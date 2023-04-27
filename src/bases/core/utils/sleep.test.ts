// noinspection ES6MissingAwait

import {sleep} from './sleep';

describe('sleep', () => {
  it('should return a promise which is resolved after specified milli seconds', async () => {
    jest.useFakeTimers();
    const fn = jest.fn();
    // eslint-disable-next-line @typescript-eslint/no-floating-promises -- because using fake timer, ca not await here.
    sleep(10).then(fn);
    // To run micro-task before running timers, use advanceTimersByTimeAsync instead of advanceTimersByTime.
    await jest.advanceTimersByTimeAsync(1);
    expect(fn).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(9);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should run callback after specified milli seconds', async () => {
    jest.useFakeTimers();
    const callback = jest.fn();
    // eslint-disable-next-line @typescript-eslint/no-floating-promises -- because using fake timer, ca not await here.
    sleep(10, callback);
    // To run micro-task before running timers, use advanceTimersByTimeAsync instead of advanceTimersByTime.
    await jest.advanceTimersByTimeAsync(1);
    expect(callback).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(9);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should return callback result', async () => {
    jest.useRealTimers();
    const value = {
      string: 'result',
      number: Math.random(),
      object: {
        key: 'value',
      },
      array: [...new Array(Math.floor(Math.random() * 10)).keys()],
    };
    const callback = jest.fn(() => value);
    const result = await sleep(10, callback);
    expect(result).toBe(value);
  });
});
