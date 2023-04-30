import type {RestContext, RestRequest} from 'msw';
import {rest} from 'msw';

import {sleep} from '@bases/core/utils';

export const echoHandlers = (baseUrl: string) => [
  rest.get(`${baseUrl}/get`, async (req, res, ctx) => {
    return res(ctx.status(200), await buildBody(req, ctx, 200, 0));
  }),
  rest.post(`${baseUrl}/post`, async (req, res, ctx) => {
    return res(ctx.status(200), await buildBody(req, ctx, 200, 0));
  }),
  rest.all(`${baseUrl}/delay/:delay`, async (req, res, ctx) => {
    const delay = Number(req.params.delay);
    const body = await buildBody(req, ctx, 200, delay);
    return sleep(delay, () => res(ctx.status(200), body));
  }),
  rest.all(`${baseUrl}/status/:status`, async (req, res, ctx) => {
    const status = Number(req.params.status);
    return res(ctx.status(status), await buildBody(req, ctx, status, 0));
  }),
];

const buildBody = async (req: RestRequest, ctx: RestContext, status: number, delay: number) => {
  return ctx.json({
    method: req.method,
    url: req.url,
    body: await req.text(),
    status,
    delay,
  });
};
