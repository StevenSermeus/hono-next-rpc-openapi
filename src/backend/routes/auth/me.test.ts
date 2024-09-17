import { testClient } from 'hono/testing';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { AppRoutes, hono } from '@/backend';
import prisma from '@/backend/libs/prisma';

const client = testClient<AppRoutes>(hono);

describe('Login', () => {
  let cookies: string[] = [];
  beforeAll(async () => {
    const res = await client.api.auth.register.$post({
      json: {
        email: 'metest@gmail.com',
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
          in: ['metest@gmail.com'],
        },
      },
    });
  });

  test('Correct', async () => {
    const res = await client.api.auth.me.$get(undefined, {
      headers: {
        cookie: cookies.join('; '),
      },
    });
    expect(res.status).toBe(200);
  });

  test('No cookie', async () => {
    const res = await client.api.auth.me.$get();
    expect(res.status).toBe(401);
  });
});
