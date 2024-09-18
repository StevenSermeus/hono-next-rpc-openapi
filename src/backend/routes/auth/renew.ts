import { getCookie, setCookie } from 'hono/cookie';
import { sign, verify } from 'hono/jwt';
import { JwtTokenExpired, JwtTokenInvalid, JwtTokenNotBefore } from 'hono/utils/jwt/types';
import { z } from 'zod';

import { OpenAPIHono, createRoute } from '@hono/zod-openapi';

import { logger } from '@/backend/libs/logger';
import prisma from '@/backend/libs/prisma';
import { defaultHook } from '@/backend/middleware/zod-handle';
import { env } from '@/config/env';

const SuccessfulSchema = z.object({
  message: z.string(),
});

const renew = new OpenAPIHono({
  defaultHook: defaultHook,
});

const meRouteOpenApi = createRoute({
  method: 'get',
  description: 'Renew the user access token',
  tags: ['Auth'],
  path: '/renew',
  security: [
    {
      RefreshToken: [],
    },
  ],
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
          schema: SuccessfulSchema,
        },
      },
    },
  },
});

export const renewRoute = renew.openapi(meRouteOpenApi, async c => {
  try {
    const refresh_token = getCookie(c, 'refresh_token');
    if (!refresh_token) {
      return c.json({ message: 'Unauthorized' }, 401);
    }

    const payload = (await verify(refresh_token, env.JWT_REFRESH_SECRET)) as { user_id: string };
    const isBlacklisted = await prisma.refreshToken.findFirst({
      where: {
        token: refresh_token,
      },
    });
    if (isBlacklisted?.isRevoked) {
      return c.json({ message: 'Unauthorized' }, 401);
    }
    const user_id = payload.user_id;
    if (!user_id) {
      return c.json({ message: 'User not found' }, 404);
    }
    const token = await sign(
      {
        user_id: user_id,
        exp: Math.floor(Date.now() / 1000) + 60 * env.ACCESS_TOKEN_EXPIRES_MINUTES,
        iat: Math.floor(Date.now() / 1000),
      },
      env.JWT_ACCESS_SECRET
    );
    setCookie(c, 'access_token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * env.ACCESS_TOKEN_EXPIRES_MINUTES,
      secure: process.env.NODE_ENV === 'production',
    });
    return c.json({ message: 'Token renewed' }, 200);
  } catch (e) {
    if (e instanceof JwtTokenExpired) {
      return c.json({ message: 'Unauthorized' }, 401);
    }
    if (e instanceof JwtTokenNotBefore) {
      return c.json({ message: 'Unauthorized' }, 401);
    }
    if (e instanceof JwtTokenInvalid) {
      return c.json({ message: 'Unauthorized' }, 401);
    }
    logger.error(e);
    return c.json({ message: 'Internal server error' }, 500);
  }
});
