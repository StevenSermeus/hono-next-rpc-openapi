import { getCookie, setCookie } from 'hono/cookie';

import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { logger } from '@/backend/libs/logger';
import prisma from '@/backend/libs/prisma';
import { BlackListedTokenCounter } from '@/backend/libs/prometheus';
import { defaultHook } from '@/backend/middleware/zod-handle';
import type { VariablesHono } from '@/backend/variables';

const logout = new OpenAPIHono<{ Variables: VariablesHono }>({
  defaultHook: defaultHook,
});

const logoutRouteOpenApi = createRoute({
  method: 'post',
  description: 'Logout',
  tags: ['Auth'],
  path: '/logout',
  security: [
    {
      RefreshToken: [],
    },
  ],
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
    setCookie(c, 'refresh_token', '', {
      maxAge: 0,
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    });
    setCookie(c, 'access_token', '', {
      maxAge: 0,
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    });
    if (!refreshToken) {
      return c.json({ message: 'Unauthorized' }, 401);
    }
    await prisma.refreshToken.update({
      where: {
        token: refreshToken,
      },
      data: {
        isRevoked: true,
      },
    });
    BlackListedTokenCounter.inc(1);
    return c.json({ message: 'Logged out' });
  } catch (e) {
    logger.error(e);
    if (e instanceof PrismaClientKnownRequestError) {
      return c.json({ message: 'Error logging out' }, 500);
    }
    return c.json({ message: 'Error logging out' }, 500);
  }
});
