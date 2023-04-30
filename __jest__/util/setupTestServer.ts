import {setupServer} from 'msw/node';

import {echoHandlers} from '@bases/server';

export const setupTestServer = (baseUrl: string) => {
  const server = setupServer(...echoHandlers(baseUrl));
  // Establish API mocking before all tests.
  beforeAll(() => server.listen());
  // Reset any request echoHandlers that we may add during the tests,
  // so they don't affect other tests.
  afterEach(() => server.resetHandlers());
  // Clean up after the tests are finished.
  afterAll(() => server.close());
  return {
    server,
    path: {
      Get: `${baseUrl}/get`,
      Post: `${baseUrl}/post`,
      Delay: (delay: number) => `${baseUrl}/delay/${delay}`,
      Status: (status: number) => `${baseUrl}/status/${status}`,
    },
  };
};
