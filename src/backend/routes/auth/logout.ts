import { deleteCookie, getCookie } from 'hono/cookie';

import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

import prisma from '@/backend/libs/prisma';
import { BlackListedTokenCounter } from '@/backend/libs/prometheus';
import { protectedRoute } from '@/backend/middleware/auth';
import type { VariablesHono } from '@/backend/variables';

const logout = new OpenAPIHono<{ Variables: VariablesHono }>();

const logoutRouteOpenApi = createRoute({
  method: 'post',
  description: 'Logout',
  tags: ['Auth'],
  path: '/logout',
  security: [
    {
      AccessToken: [],
      RefreshToken: [],
    },
  ],
  middleware: [protectedRoute],
  responses: {
    200: {
      description: 'Logout Successful',
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
      description: 'Internal Server Error',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
  },
});

export const logoutRoute = logout.openapi(logoutRouteOpenApi, async c => {
  try {
    const refreshToken = getCookie(c, 'refresh_token');
    const accessToken = getCookie(c, 'access_token');
    if (refreshToken === undefined || accessToken === undefined) {
      //should be unreachable since we are using the protectedRoute middleware
      return c.json({ message: 'Already not connected' }, 200);
    }
    deleteCookie(c, 'access_token');
    deleteCookie(c, 'refresh_token');
    await prisma.blacklist.createMany({
      data: [
        {
          id: refreshToken,
        },
        {
          id: accessToken,
        },
      ],
    });
    BlackListedTokenCounter.inc(2);
    return c.json({ message: 'Logged out' });
  } catch (e) {
    return c.json({ message: 'Error logging out' }, 500);
  }
});
