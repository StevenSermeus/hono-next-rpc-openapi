import { setCookie } from 'hono/cookie';
import { sign } from 'hono/jwt';
import { z } from 'zod';

import { OpenAPIHono, createRoute } from '@hono/zod-openapi';

import { env } from '@/backend/config/env';
import { logger } from '@/backend/libs/logger';
import { UserSchema } from '@/backend/libs/openApi';
import { compare } from '@/backend/libs/password';
import prisma from '@/backend/libs/prisma';
import { loginValidationHook } from '@/backend/middleware/zod-handle';
import type { VariablesHono } from '@/backend/variables';
import { ConnectionAttemptsFailedCounter } from '@/libs/prometheus';

export const loginRouteOpenApi = createRoute({
  method: 'post',
  description: 'Login as a user',
  tags: ['Auth'],
  path: '/login',
  security: [],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            email: z
              .string({
                message: 'You must provide a valid email !',
              })
              .email('You must provide a valid email !')
              .openapi({ example: 'johndoe@gmail.com' }),
            password: z
              .string({
                message: 'You must provide a valid password !',
              })
              .min(8, 'Your password must be at lease 8 characters long')
              .openapi({ example: 'CompleXPAssWORD123###' }),
          }),
        },
      },
    },
  },
  responses: {
    400: {
      description: 'Bad Request',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    404: {
      description: 'User Not Found',
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
    200: {
      description: 'Login Successful',
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
    },
  },
});

const login = new OpenAPIHono<{ Variables: VariablesHono }>({
  defaultHook: loginValidationHook,
});

export const loginRoute = login.openapi(loginRouteOpenApi, async c => {
  const { email, password } = c.req.valid('json');
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (user === null) {
      ConnectionAttemptsFailedCounter.inc(1);
      return c.json({ message: 'Failed to login' }, 404);
    }
    const [verified, verifyError] = await compare(password, user.password);
    if (verifyError !== null) {
      return c.json({ message: verifyError.message }, 500);
    }
    if (!verified) {
      ConnectionAttemptsFailedCounter.inc(1);
      return c.json({ message: 'Failed to login' }, 400);
    }
    const token = await sign(
      {
        user_id: user.id,
        exp: Math.floor(Date.now() / 1000) + 60 * env.ACCESS_TOKEN_EXPIRES_MINUTES,
        iat: Math.floor(Date.now() / 1000),
      },
      env.JWT_ACCESS_SECRET
    );
    const refreshToken = await sign(
      {
        user_id: user.id,
        exp:
          Math.round(new Date().getTime() / 1000) + 60 * 60 * 24 * env.REFRESH_TOKEN_EXPIRES_DAYS,
        iat: Math.floor(Date.now() / 1000),
      },
      env.JWT_REFRESH_SECRET
    );
    setCookie(c, 'refresh_token', refreshToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * env.REFRESH_TOKEN_EXPIRES_DAYS,
      secure: process.env.NODE_ENV === 'production',
      path: '/api/v1/auth/token',
    });
    setCookie(c, 'access_token', token, {
      httpOnly: true,
      maxAge: 60 * env.ACCESS_TOKEN_EXPIRES_MINUTES,
      secure: process.env.NODE_ENV === 'production',
    });
    const token_db = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
      },
    });
    if (token_db !== null && token_db.isRevoked) {
      ConnectionAttemptsFailedCounter.inc(1);
      return c.json({ message: 'Failed to login' }, 400);
    }
    if (token_db === null) {
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          isRevoked: false,
        },
      });
    }
    return c.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      200
    );
  } catch (error) {
    ConnectionAttemptsFailedCounter.inc(1);
    logger.error(error);
    return c.json({ message: 'Failed to login' }, 500);
  }
});
