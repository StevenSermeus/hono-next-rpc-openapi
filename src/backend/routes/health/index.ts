import { z } from 'zod';

import { OpenAPIHono, createRoute } from '@hono/zod-openapi';

import type { VariablesHono } from '@/backend/variables';

export const healthRouteOpenApi = createRoute({
  method: 'get',
  description: 'Health',
  tags: ['Health'],
  path: '/health',
  security: [],
  responses: {
    200: {
      description: 'Login Successful',
      content: {
        'application/json': {
          schema: z.object({
            status: z.string(),
          }),
        },
      },
    },
  },
});

const health = new OpenAPIHono<{ Variables: VariablesHono }>();

export const healthRoute = health.openapi(healthRouteOpenApi, async c => {
  return c.json({ status: 'ok' }, 200);
});
