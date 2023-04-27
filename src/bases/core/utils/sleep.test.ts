import {sleep} from './sleep';

describe('sleep', () => {
  it('should return a promise which is resolved after specified milli seconds', async () => {
    jest.useFakeTimers();
    const fn = jest.fn();
    // eslint-disable-next-line @typescript-eslint/no-floating-promises -- sleep is not awaited intentionally.
    sleep(10).then(fn);
    // To run micro-task before running timers, use advanceTimersByTimeAsync instead of advanceTimersByTime.
    await jest.advanceTimersByTimeAsync(1);
    expect(fn).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(9);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
