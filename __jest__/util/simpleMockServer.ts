import {rest} from 'msw';
import {setupServer} from 'msw/node';

import {sleep} from '@bases/core/utils';

const handlers = (baseUrl: string) => [
  rest.get(`${baseUrl}/get`, (req, res, ctx) => {
    return res(ctx.status(200));
  }),
  rest.post(`${baseUrl}/post`, (req, res, ctx) => {
    return res(ctx.status(200));
  }),
  rest.all(`${baseUrl}/delay/:delay`, (req, res, ctx) => {
    return sleep(Number(req.params.delay)).then(() => res(ctx.status(200)));
  }),
  rest.all(`${baseUrl}/status/:status`, (req, res, ctx) => {
    return res(ctx.status(Number(req.params.status)));
  }),
];

export const createMockServer = (baseUrl: string) => {
  const server = setupServer(...handlers(baseUrl));
  // Establish API mocking before all tests.
  beforeAll(() => server.listen());
  // Reset any request handlers that we may add during the tests,
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
