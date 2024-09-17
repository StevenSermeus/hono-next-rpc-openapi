import { testClient } from 'hono/testing';
import { afterAll, describe, expect, test } from 'vitest';

import { AppRoutes, hono } from '@/backend';
import prisma from '@/backend/libs/prisma';
import { RESPONSE_TIMEOUT, Timer } from '@/tests/utils';

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

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['test69999dqsdqs@gmail.com', 'testIntegration0@gmail.com'],
        },
      },
    });
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
    const time = new Timer();
    const res = await client.api.auth.register.$post({
      json: {
        email: 'testIntegration0@gmail.com',
        password: '#Password123',
        name: 'John Doe',
      },
    });
    expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
    expect(res.status).toBe(400);
  });
});

describe('Register input validation', () => {
  test('No @ in the email', async () => {
    const client = testClient<AppRoutes>(hono);
    const time = new Timer();
    const res = await client.api.auth.register.$post({
      json: {
        email: 'test',
        password: '#Password123',
        name: 'John Doe',
      },
    });
    expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
    expect(res.status).toBe(400);
  });

  test('No . in the email', async () => {
    const client = testClient<AppRoutes>(hono);
    const time = new Timer();
    const res = await client.api.auth.register.$post({
      json: {
        email: 'test@gmail',
        password: '#Password123',
        name: 'John Doe',
      },
    });
    expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
    expect(res.status).toBe(400);
  });

  test('No name', async () => {
    const client = testClient<AppRoutes>(hono);
    const time = new Timer();
    const res = await client.api.auth.register.$post({
      //@ts-expect-error - Testing invalid input
      json: {
        email: 'test@gmail.com',
        password: '#Password123',
      },
    });
    expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({
      message: 'You must provide a valid name !',
    });
  });

  test('Too weak password too small and only numbers', async () => {
    const client = testClient<AppRoutes>(hono);
    const time = new Timer();
    const res = await client.api.auth.register.$post({
      json: {
        email: 'test@gmail.com',
        password: '123',
        name: 'John Doe',
      },
    });
    expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({
      message: 'Your password must be at lease 8 characters long',
    });
  });

  test('Too weak password only letters', async () => {
    const client = testClient<AppRoutes>(hono);
    const time = new Timer();
    const res = await client.api.auth.register.$post({
      json: {
        email: 'test@gmail.com',
        password: 'testqqsdqsmdqs',
        name: 'John Doe',
      },
    });
    expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({
      message:
        'Your password must contain at least 1 uppercase, 1 lowercase, 1 number, 1 special character',
    });
  });
});
