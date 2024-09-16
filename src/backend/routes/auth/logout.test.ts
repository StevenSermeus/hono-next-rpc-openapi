import { testClient } from 'hono/testing';
import { beforeAll, describe, expect, test } from 'vitest';

import { AppRoutes, hono } from '@/backend';

const client = testClient<AppRoutes>(hono);
describe('Logout', () => {
  let cookies: string[] = [];
  beforeAll(async () => {
    const res = await client.api.auth.register.$post({
      json: {
        email: 'logouttest@gmail.com',
        password: '#Password123',
        name: 'John Doe',
      },
    });
    cookies = res.headers.getSetCookie();
  });
  test('Correct', async () => {
    const res = await client.api.auth.me.$get(undefined, {
      headers: {
        cookie: cookies.join('; '),
      },
    });
    expect(res.status).toBe(200);
    const res2 = await client.api.auth.token.logout.$post(undefined, {
      headers: {
        cookie: cookies.join('; '),
      },
    });
    expect(res2.status).toBe(200);

    expect(res2.headers.getSetCookie()).toEqual([
      'refresh_token=; Max-Age=0; Path=/; HttpOnly',
      'access_token=; Max-Age=0; Path=/; HttpOnly',
    ]);
  });
});