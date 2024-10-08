import { testClient } from 'hono/testing';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { AppRoutes, hono } from '@/backend';
import prisma from '@/backend/libs/prisma';
import { RESPONSE_TIMEOUT, Timer } from '@/tests/utils';

const client = testClient<AppRoutes>(hono);
describe('Logout', () => {
  let cookies: string[] = [];
  beforeAll(async () => {
    const res = await client.api.v1.auth.register.$post({
      json: {
        email: 'logouttest@gmail.com',
        password: '#Password123',
        name: 'John Doe',
      },
    });
    cookies = res.headers.getSetCookie();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['logouttest@gmail.com'],
        },
      },
    });
  });

  test(`Response time is less than ${RESPONSE_TIMEOUT} in success`, async () => {
    const time = new Timer();
    await client.api.v1.auth.token.logout.$post(undefined, {
      headers: {
        cookie: cookies.join('; '),
      },
    });
    expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
  });

  test(`Response time is less than ${RESPONSE_TIMEOUT} in failure`, async () => {
    const time = new Timer();
    await client.api.v1.auth.token.logout.$post();
    expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
  });

  test('Correct', async () => {
    const res = await client.api.v1.auth.me.$get(undefined, {
      headers: {
        cookie: cookies.join('; '),
      },
    });
    expect(res.status).toBe(200);
    const time = new Timer();
    const res2 = await client.api.v1.auth.token.logout.$post(undefined, {
      headers: {
        cookie: cookies.join('; '),
      },
    });
    expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
    expect(res2.status).toBe(200);

    expect(res2.headers.getSetCookie()).toEqual([
      'refresh_token=; Max-Age=0; Path=/; HttpOnly',
      'access_token=; Max-Age=0; Path=/; HttpOnly',
    ]);
  });
});
