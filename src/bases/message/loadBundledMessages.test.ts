import {ApplicationError, assertRuntimeError, RuntimeError} from '@bases/core/errors';

import * as Message from './Message';
import {loadBundledMessages} from './loadBundledMessages';

describe('loadBundledMessages', () => {
  it('should load bundled messages', async () => {
    await loadBundledMessages();

    expect(Message.m('validation.mixed.required')).toBeTruthy();
  });

  it('should throw RuntimeError when error occurred on loading message', async () => {
    expect.assertions(3);
    jest.spyOn(Message, 'loadMessages').mockImplementation(() => {
      throw new ApplicationError();
    });
    try {
      await loadBundledMessages();
    } catch (error) {
      assertRuntimeError(error);
      /* eslint-disable jest/no-conditional-expect -- Using expect.assertions to prevent mistakes */
      expect(error).toBeInstanceOf(RuntimeError);
      expect(error.message).toBe('Failed to load message.');
      expect(error.errorCode).toBe('LoadBundledMessageError');
      /* eslint-enable */
    }
  });
});
