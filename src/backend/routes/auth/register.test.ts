import { testClient } from 'hono/testing';
import { describe, expect, test } from 'vitest';

import { AppRoutes, hono } from '@/backend';

describe('Register', () => {
  test('Correct', async () => {
    const client = testClient<AppRoutes>(hono);
    const res = await client.api.auth.register.$post({
      json: {
        email: 'test69999dqsdqs@gmail.com',
        password: '#Password123',
        name: 'John Doe',
      },
    });
    const res2 = await client.api.auth.me.$get(undefined, {
      headers: {
        cookie: res.headers.getSetCookie().join('; '),
      },
    });
    expect(res.status).toBe(201);
    expect(res2.status).toBe(200);
  });

  test('Already used email', async () => {
    const client = testClient<AppRoutes>(hono);
    await client.api.auth.register.$post({
      json: {
        email: 'testIntegration0@gmail.com',
        password: '#Password123',
        name: 'John Doe',
      },
    });
    const res = await client.api.auth.register.$post({
      json: {
        email: 'testIntegration0@gmail.com',
        password: '#Password123',
        name: 'John Doe',
      },
    });
    expect(res.status).toBe(400);
  });
});
