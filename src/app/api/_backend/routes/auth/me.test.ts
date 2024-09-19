import { sign } from 'hono/jwt';
import { testClient } from 'hono/testing';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { AppRoutes, hono } from '@/backend';
import { env } from '@/backend/config/env';
import prisma from '@/backend/libs/prisma';
import { RESPONSE_TIMEOUT, Timer } from '@/tests/utils';

const client = testClient<AppRoutes>(hono);

describe('Me', async () => {
  let cookies: string[] = [];
  let jwt: string;
  beforeAll(async () => {
    const res = await client.api.v1.auth.register.$post({
      json: {
        email: 'metest@gmail.com',
        password: '#Password123',
        name: 'John Doe',
      },
    });
    cookies = res.headers.getSetCookie();

    if (res.ok) {
      const user = await res.json();
      jwt = await sign(
        { user_id: user.id, exp: new Date().getTime() / 1000 - 50 },
        env.JWT_REFRESH_SECRET
      );
    }
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['metest@gmail.com'],
        },
      },
    });
  });

  test(`Response time is less than ${RESPONSE_TIMEOUT} in success`, async () => {
    const time = new Timer();
    await client.api.v1.auth.me.$get();
    expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
  });

  test(`Response time is less than ${RESPONSE_TIMEOUT} in failure`, async () => {
    const time = new Timer();
    await client.api.v1.auth.me.$get();
    expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
  });

  test('Correct', async () => {
    const time = new Timer();
    const res = await client.api.v1.auth.me.$get(undefined, {
      headers: {
        cookie: cookies.join('; '),
      },
    });
    expect(res.status).toBe(200);
    expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
    expect(await res.json()).toMatchObject({
      email: 'metest@gmail.com',
      name: 'John Doe',
    });
  });

  test('No cookie', async () => {
    const time = new Timer();
    const res = await client.api.v1.auth.me.$get();
    expect(res.status).toBe(401);
    expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
    expect(await res.json()).toEqual({ message: 'Unauthorized' });
  });

  test('Expired token', async () => {
    const time = new Timer();
    const res = await client.api.v1.auth.me.$get(undefined, {
      headers: {
        cookie: `refresh_token=${jwt}; Max-Age=604800;`,
      },
    });
    expect(res.status).toBe(401);
    expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
    expect(await res.json()).toEqual({ message: 'Unauthorized' });
  });
});
