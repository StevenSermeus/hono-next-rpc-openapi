import { testClient } from 'hono/testing';
import { beforeAll, describe, expect, test } from 'vitest';

import { AppRoutes, hono } from '@/backend';

const client = testClient<AppRoutes>(hono);

describe('Renew', () => {
  let cookies: string[] = [];
  beforeAll(async () => {
    const res = await client.api.auth.register.$post({
      json: {
        email: 'renewtest@gmail.com',
        password: '#Password123',
        name: 'John Doe',
      },
    });
    cookies = res.headers.getSetCookie();
  });
  test('Correct', async () => {
    const res = await client.api.auth.token.renew.$get(undefined, {
      headers: {
        cookie: cookies.join('; '),
      },
    });

    expect(res.status).toBe(200);
    //res.getCookies is size of 1 and the cookie is access_token
    expect(res.headers.getSetCookie().length).toBe(1);
    expect(res.headers.getSetCookie()[0]).toContain('access_token');
  });
});
