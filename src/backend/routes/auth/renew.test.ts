import { testClient } from 'hono/testing';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { AppRoutes, hono } from '@/backend';
import prisma from '@/backend/libs/prisma';
import { RESPONSE_TIMEOUT, Timer } from '@/tests/utils';

const client = testClient<AppRoutes>(hono);

describe('Renew', () => {
  let cookies: string[] = [];
  beforeAll(async () => {
    const res = await client.api.v1.auth.register.$post({
      json: {
        email: 'renewtest@gmail.com',
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
          in: ['renewtest@gmail.com'],
        },
      },
    });
  });

  test(`Response time is less than ${RESPONSE_TIMEOUT} in success`, async () => {
    const client = testClient<AppRoutes>(hono);
    const time = new Timer();
    await client.api.v1.auth.token.renew.$get(undefined, {
      headers: { cookie: cookies.join('; ') },
    });
    expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
  });

  test(`Response time is less than ${RESPONSE_TIMEOUT} in failure`, async () => {
    const client = testClient<AppRoutes>(hono);
    const time = new Timer();
    await client.api.v1.auth.token.renew.$get();
    expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
  });

  test('Correct', async () => {
    const time = new Timer();
    const res = await client.api.v1.auth.token.renew.$get(undefined, {
      headers: {
        cookie: cookies.join('; '),
      },
    });
    expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
    expect(res.status).toBe(200);
    //res.getCookies is size of 1 and the cookie is access_token
    expect(res.headers.getSetCookie().length).toBe(1);
    expect(res.headers.getSetCookie()[0]).toContain('access_token');
  });

  test('Incorrect', async () => {
    const time = new Timer();
    const res = await client.api.v1.auth.token.renew.$get(undefined, {
      headers: {
        cookie: 'access_token=invalid',
      },
    });
    expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
    expect(res.status).toBe(401);
  });

  test('No cookie', async () => {
    const time = new Timer();
    const res = await client.api.v1.auth.token.renew.$get();
    expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
    expect(res.status).toBe(401);
  });

  test('Invalid cookie', async () => {
    const time = new Timer();
    const res = await client.api.v1.auth.token.renew.$get(undefined, {
      headers: {
        cookie: 'refresh_token=invalid',
      },
    });
    expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
    expect(res.status).toBe(401);
  });
});
