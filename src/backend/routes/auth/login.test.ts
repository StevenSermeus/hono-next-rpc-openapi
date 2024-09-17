import { testClient } from 'hono/testing';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { AppRoutes, hono } from '@/backend/index';
import prisma from '@/backend/libs/prisma';
import { RESPONSE_TIMEOUT, Timer } from '@/tests/utils';

const client = testClient<AppRoutes>(hono);

describe('Login', () => {
  beforeAll(async () => {
    await client.api.v1.auth.register.$post({
      json: {
        email: 'testlogin@gmail.com',
        password: '#Password123',
        name: 'John Doe',
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['testlogin@gmail.com'],
        },
      },
    });
  });

  test('Correct', async () => {
    const time = new Timer();
    const res = await client.api.v1.auth.login.$post({
      json: {
        email: 'testlogin@gmail.com',
        password: '#Password123',
      },
    });
    expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
    expect(res.status).toBe(200);
  });

  test('Wrong password', async () => {
    const time = new Timer();
    const res = await client.api.v1.auth.login.$post({
      json: {
        email: 'testlogin@gmail.com',
        password: '#Password1234',
      },
    });
    expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
    expect(res.status).toBe(400);
  });
});
