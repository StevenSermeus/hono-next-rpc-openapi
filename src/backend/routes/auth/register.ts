import { setCookie } from 'hono/cookie';
import { sign } from 'hono/jwt';
import { z } from 'zod';

import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { Prisma } from '@prisma/client';

import { env } from '@/backend/config/env';
import { logger } from '@/backend/libs/logger';
import { UserSchema } from '@/backend/libs/openApi';
import { hash } from '@/backend/libs/password';
import prisma from '@/backend/libs/prisma';
import { defaultHook } from '@/backend/middleware/zod-handle';
import type { VariablesHono } from '@/backend/variables';

export const registerRouteOpenApi = createRoute({
  method: 'post',
  description: 'Register a new user',
  tags: ['Auth'],
  path: '/register',
  security: [],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            email: z
              .string({ message: 'You must provide a valid email !' })
              .email('You must provide a valid email !')

              .openapi({ example: 'johndoe@gmail.com' }),
            password: z
              .string({ message: 'You must provide a valid password !' })
              .min(8, 'Your password must be at lease 8 characters long')
              //regex at lease 1 uppercase, 1 lowercase, 1 number, 1 special character
              .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/,
                'Your password must contain at least 1 uppercase, 1 lowercase, 1 number, 1 special character'
              )
              .openapi({ example: 'CompleXPAssWORD123###' }),
            name: z
              .string({ message: 'You must provide a valid name !' })
              .min(2, 'Your name should at lease contain 2 letters')
              .openapi({ example: 'John Doe' }),
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
            message: z.string().openapi({ example: 'Failed to register, email already used' }),
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
    201: {
      description: 'Login Successful',
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
    },
  },
});

const register = new OpenAPIHono<{ Variables: VariablesHono }>({
  defaultHook: defaultHook,
});

export const registerRoute = register.openapi(registerRouteOpenApi, async c => {
  const { email, password, name } = c.req.valid('json');
  const [hashedPassword, hashError] = await hash(password);
  if (hashError !== null) {
    return c.json({ message: 'Failed to register' }, 500);
  }
  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
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
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
        iat: Math.floor(Date.now() / 1000),
      },
      env.JWT_REFRESH_SECRET
    );
    setCookie(c, 'refresh_token', refreshToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * env.REFRESH_TOKEN_EXPIRES_DAYS,
      path: '/api/v1/auth/token',
    });
    setCookie(c, 'access_token', token, {
      httpOnly: true,
      maxAge: 60 * env.ACCESS_TOKEN_EXPIRES_MINUTES,
    });
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
      },
    });
    return c.json({ email: user.email, name: user.name, id: user.id }, 201);
  } catch (e) {
    logger.error(e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (e.code === 'P2002') {
        logger.info(
          'There is a unique constraint violation, a new user cannot be created with this email'
        );
        return c.json({ message: 'Failed to register, email already used' }, 400);
      }
    }
    return c.json({ message: `Failed to register` }, 500);
  }
});
