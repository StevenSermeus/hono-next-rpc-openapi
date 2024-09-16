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

describe('Register input validation', () => {
  test('No @ in the email', async () => {
    const client = testClient<AppRoutes>(hono);
    const res = await client.api.auth.register.$post({
      json: {
        email: 'test',
        password: '#Password123',
        name: 'John Doe',
      },
    });
    expect(res.status).toBe(400);
  });

  test('No . in the email', async () => {
    const client = testClient<AppRoutes>(hono);
    const res = await client.api.auth.register.$post({
      json: {
        email: 'test@gmail',
        password: '#Password123',
        name: 'John Doe',
      },
    });
    expect(res.status).toBe(400);
  });

  test('No name', async () => {
    const client = testClient<AppRoutes>(hono);

    const res = await client.api.auth.register.$post({
      //@ts-expect-error - Testing invalid input
      json: {
        email: 'test@gmail.com',
        password: '#Password123',
      },
    });
    expect(res.status).toBe(400);
  });

  test('Too weak password too small and only numbers', async () => {
    const client = testClient<AppRoutes>(hono);
    const res = await client.api.auth.register.$post({
      json: {
        email: 'test@gmail.com',
        password: '123',
        name: 'John Doe',
      },
    });
    expect(res.status).toBe(400);
  });
});
