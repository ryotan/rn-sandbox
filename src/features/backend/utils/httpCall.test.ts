import {AxiosError, isCancel} from 'axios';

import {setupTestServer} from '@@/__jest__/util/setupTestServer';
import {assertRequestCancelledError} from '@features/backend/errors/RequestCancelledError';

import {httpCall} from './httpCall';

const {path} = setupTestServer('https://mock.example.dev');

jest.mock('expo-application', () => ({
  applicationName: 'client-app',
  nativeApplicationVersion: '0.1.0',
}));
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'client-os',
  Version: '14.3.2',
}));

describe('httpCall', () => {
  it('should return response if api responded normally', async () => {
    const response = await httpCall({url: path.Get});
    expect(response.status).toBe(200);

    // assert User-Agent header
    const ua = response.config.headers['User-Agent'];
    expect(ua).toBe(`client-app/0.1.0 (client-os 14.3.2)`);

    // assert Accept header
    expect(response.config.headers['Accept']).toBe('application/json');
  });

  it('should throw RequestCancelledError if api did not respond within specified time', async () => {
    const timeout = 100;
    // To prevent mistakes that can occur when using "expect" within conditional statements, "expect.assertions" is used.
    expect.assertions(5);
    try {
      await httpCall({method: 'delete', url: path.Delay(200), timeout});
    } catch (e) {
      assertRequestCancelledError(e);
      /* eslint-disable jest/no-conditional-expect -- Using expect.assertions to prevent mistakes */
      expect(e.message).toMatch(/cancelled/i);
      expect(e.message).toMatch(/abort/i);
      expect(e.message).toMatch(`timeout=[${timeout}ms]`);
      expect(e.message).toMatch(`url=[${path.Delay(200)}]`);
      expect(isCancel(e.cause)).toBe(true);
      /* eslint-enable */
    }
  });

  it('should throw original error if api responded with 3xx', async () => {
    const timeout = 100;
    await expect(httpCall({method: 'get', url: path.Status(302), timeout})).rejects.toThrow(AxiosError);
  });

  it('should throw original error if api responded with 4xx', async () => {
    const timeout = 100;
    await expect(httpCall({method: 'post', url: path.Status(400), timeout})).rejects.toThrow(AxiosError);
  });

  it('should throw original error if api responded with 5xx', async () => {
    const timeout = 100;
    await expect(httpCall({method: 'put', url: path.Status(500), timeout})).rejects.toThrow(AxiosError);
  });

  it('should be able to cancel request manually', async () => {
    // To prevent mistakes that can occur when using "expect" within conditional statements, "expect.assertions" is used.
    expect.assertions(6);
    const timeout = 200;
    const source = new AbortController();
    const response = httpCall({method: 'patch', url: path.Delay(500), signal: source.signal, timeout});
    source.abort();
    try {
      await response;
    } catch (e) {
      assertRequestCancelledError(e);
      /* eslint-disable jest/no-conditional-expect -- Using expect.assertions to prevent mistakes */
      expect(e.message).toMatch(/cancelled/i);
      expect(e.message).toMatch(/abort/i);
      expect(e.message).toMatch('method=[patch]');
      expect(e.message).toMatch(`timeout=[${timeout}ms]`);
      expect(e.message).toMatch(`url=[${path.Delay(500)}]`);
      expect(isCancel(e.cause)).toBe(true);
      /* eslint-enable */
    }
  });

  it('can override default configurations', async () => {
    const response = await httpCall({url: path.Get, headers: {'User-Agent': 'test'}});
    expect(response.status).toBe(200);

    // assert default User-Agent header is overridden
    expect(response.config.headers['User-Agent']).toBe('test');

    // assert default Accept header is not overridden
    expect(response.config.headers['Accept']).toBe('application/json');
  });
});
