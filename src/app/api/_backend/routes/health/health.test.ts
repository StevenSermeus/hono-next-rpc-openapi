import { testClient } from 'hono/testing';
import { describe, expect, test } from 'vitest';

import { AppRoutes, hono } from '@/backend';
import { RESPONSE_TIMEOUT, Timer } from '@/tests/utils';

const client = testClient<AppRoutes>(hono);

describe('Health', () => {
  test('Correct', async () => {
    const res = await client.api.health.$get();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });

  test(`Response time is less than ${RESPONSE_TIMEOUT} in success`, async () => {
    const client = testClient<AppRoutes>(hono);
    const time = new Timer();
    await client.api.health.$get();
    expect(time.end()).toBeLessThan(RESPONSE_TIMEOUT);
  });
});
