import axios, {AxiosError, isAxiosError} from 'axios';
import {setupServer} from 'msw/node';

import {echoHandlers} from './echoHandlers';
import {startMswServer} from './startMswServer';

describe('startMswServer', () => {
  let unsubscribe: () => unknown;
  beforeAll(() => {
    unsubscribe = startMswServer(setupServer, echoHandlers('https://start.msw.server'));
  });
  afterAll(() => {
    unsubscribe?.();
  });
  describe('should start MSW server', () => {
    test('get', async () => {
      const timestamp = Date.now();
      const url = 'https://start.msw.server/get';
      const result = await axios.get(url, {data: {timestamp}});
      expect(result.data).toHaveProperty('url', url);
      expect(result.data).toHaveProperty('method', 'GET');
      expect(result.data).toHaveProperty('body', `{"timestamp":${timestamp}}`);
      expect(result.data).toHaveProperty('delay', 0);
      expect(result.data).toHaveProperty('status', 200);
    });

    test('post', async () => {
      const timestamp = Date.now();
      const url = 'https://start.msw.server/post';
      const result = await axios.post(url, {timestamp});
      expect(result.data).toHaveProperty('url', url);
      expect(result.data).toHaveProperty('method', 'POST');
      expect(result.data).toHaveProperty('body', `{"timestamp":${timestamp}}`);
      expect(result.data).toHaveProperty('delay', 0);
      expect(result.data).toHaveProperty('status', 200);
    });

    test('delay', async () => {
      const timestamp = Date.now();
      const url = 'https://start.msw.server/delay/10';
      const result = await axios.put(url, {timestamp});
      expect(result.data).toHaveProperty('url', url);
      expect(result.data).toHaveProperty('method', 'PUT');
      expect(result.data).toHaveProperty('body', `{"timestamp":${timestamp}}`);
      expect(result.data).toHaveProperty('delay', 10);
      expect(result.data).toHaveProperty('status', 200);
    });

    test('status', async () => {
      const timestamp = Date.now();
      const url = 'https://start.msw.server/status/404';
      const result = await axios
        .delete(url, {data: {timestamp}})
        .catch(e => (isAxiosError(e) ? e.response : undefined));
      expect(result?.data).toHaveProperty('url', url);
      expect(result?.data).toHaveProperty('method', 'DELETE');
      expect(result?.data).toHaveProperty('body', `{"timestamp":${timestamp}}`);
      expect(result?.data).toHaveProperty('delay', 0);
      expect(result?.data).toHaveProperty('status', 404);
    });

    test('pass-through not registered url (for test coverage...)', async () => {
      await expect(axios.get('https://start.msw.server/not-registerd-url')).rejects.toThrow(AxiosError);
    });

    test('unsubscribe', async () => {
      unsubscribe();
      // After unsubscribing, should not be able to access the endpoint.
      await expect(axios.get('https://start.msw.server/get')).rejects.toThrow(AxiosError);
    });
  });
});
