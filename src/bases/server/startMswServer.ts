import type {RequestHandler} from 'msw';
import type {SetupServer, SetupServerApi} from 'msw/node';
import {setupURLPolyfill} from 'react-native-url-polyfill';

export const startMswServer = (
  setupServer: (...handlers: RequestHandler[]) => SetupServer | SetupServerApi,
  handlers: RequestHandler[],
) => {
  setupURLPolyfill();
  const server = setupServer(...handlers);
  server.listen({
    onUnhandledRequest(req) {
      req.passthrough();
    },
  });
  return () => server.close();
};
