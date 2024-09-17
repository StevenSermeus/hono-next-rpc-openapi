import { testClient } from 'hono/testing';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { AppRoutes, hono } from '@/backend';
import prisma from '@/backend/libs/prisma';

const client = testClient<AppRoutes>(hono);

describe('Login', () => {
  beforeAll(async () => {
    await client.api.auth.register.$post({
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
    const res = await client.api.auth.login.$post({
      json: {
        email: 'testlogin@gmail.com',
        password: '#Password123',
      },
    });
    expect(res.status).toBe(200);
  });

  test('Wrong password', async () => {
    const res = await client.api.auth.login.$post({
      json: {
        email: 'testlogin@gmail.com',
        password: '#Password1234',
      },
    });
    expect(res.status).toBe(400);
  });
});
