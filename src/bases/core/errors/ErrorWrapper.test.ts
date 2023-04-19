import {ErrorWrapper, mergeStackTrace} from './ErrorWrapper';

class SomeError extends Error {}
const cause = new SomeError('root cause');

class ErrorWrapperSubClass extends ErrorWrapper {}
const nested = new ErrorWrapperSubClass('nested cause', cause);

describe.each([
  [[] as const, {message: '', cause: undefined, stack: /^ErrorWrapper: (\r?\n\s+at\s.+)*/m}],
  [['message exists'] as const, {message: 'message exists', cause: undefined, stack: /a/m}],
  [
    [cause] as const,
    {
      message: '',
      cause,
      stack: /^ErrorWrapper: (\r?\n\s+at\s.+)*\r?\nCaused by: Error: root cause(\r?\n\s+at\s.+)*/m,
    },
  ],
  [
    ['some message', cause] as const,
    {
      message: 'some message',
      cause,
      stack: /^ErrorWrapper: some message(\r?\n\s+at\s.+)*\r?\nCaused by: Error: root cause(\r?\n\s+at\s.+)*/m,
    },
  ],
  [
    ['some message', nested] as const,
    {
      message: 'some message',
      cause: nested,
      stack:
        /^ErrorWrapper: some message(\r?\n\s+at\s.+)*\r?\nCaused by: ErrorWrapperSubClass: nested cause(\r?\n\s+at\s.+)*\r?\nCaused by: Error: root cause(\r?\n\s+at\s.+)*/m,
    },
  ],
])('ErrorWrapper for args=%s', (args, expected) => {
  const sut =
    args.length === 0 ? new ErrorWrapper() : args.length === 1 ? new ErrorWrapper(args[0]) : new ErrorWrapper(...args);

  it('should have the expected message', () => {
    expect(sut.name).toBe('ErrorWrapper');
    expect(sut.message).toBe(expected.message);
  });
  it('should have the expected cause', () => {
    expect(sut.cause).toBe(expected.cause);
  });
  it('should match the expected stack', () => {
    expect(sut.stack).toMatch(expected.stack);
  });
});

describe.each([
  [undefined, undefined, undefined],
  ['', undefined, ''],
  [undefined, '', 'Caused by: '],
])('mergeStackTrace', (newStackTrace, baseStackTrace, mergedStackTrace) => {
  it('should merge stack trace', () => {
    expect(mergeStackTrace(newStackTrace, baseStackTrace)).toBe(mergedStackTrace);
  });
});
