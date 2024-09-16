import { z } from 'zod';

import { OpenAPIHono, createRoute } from '@hono/zod-openapi';

import { UserSchema } from '@/backend/libs/openApi';
import prisma from '@/backend/libs/prisma';
import { protectedRoute } from '@/backend/middleware/auth';
import type { VariablesHono } from '@/backend/variables';

const me = new OpenAPIHono<{ Variables: VariablesHono }>();

const meRouteOpenApi = createRoute({
  method: 'get',
  description: 'Get user information',
  tags: ['Auth'],
  path: '/me',
  security: [
    {
      AccessToken: [],
    },
  ],
  middleware: [protectedRoute],
  responses: {
    404: {
      description: 'User not found',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    401: {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    200: {
      description: 'User information',
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
    },
  },
});

export const meRoute = me.openapi(meRouteOpenApi, async c => {
  try {
    const user_id = c.get('user_id');
    if (!user_id) {
      return c.json({ message: 'User not found' }, 404);
    }
    const user = await prisma.user.findUnique({
      where: {
        id: user_id,
      },
    });
    if (user === null) {
      return c.json({ message: 'User not found' }, 404);
    }
    return c.json(
      {
        email: user.email,
        id: user.id,
        name: user.name,
      },
      200
    );
  } catch (e) {
    console.error(e);
    return c.json({ message: 'Internal server error' }, 500);
  }
});
