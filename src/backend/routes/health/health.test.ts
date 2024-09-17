import { testClient } from 'hono/testing';
import { describe, expect, test } from 'vitest';

import { AppRoutes, hono } from '@/backend';

const client = testClient<AppRoutes>(hono);

describe('Health', () => {
  test('Correct', async () => {
    const res = await client.api.health.$get();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });
});
