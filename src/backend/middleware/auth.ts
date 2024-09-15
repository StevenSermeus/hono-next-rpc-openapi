import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import { sign, verify } from 'hono/jwt';
import { JwtTokenExpired } from 'hono/utils/jwt/types';

import prisma from '@/backend/libs/prisma';
import { env } from '@/config/env';

export const protectedRoute = createMiddleware(async (c, next) => {
  const token = getCookie(c, 'access_token');
  const isBlacklisted = await prisma.blacklist.findFirst({
    where: {
      id: token,
    },
  });
  if (isBlacklisted !== null) {
    deleteCookie(c, 'access_token');
    deleteCookie(c, 'refresh_token');
    return c.json({ message: 'Unauthorized' }, 401);
  }
  try {
    if (token === undefined) {
      const refresh_token = getCookie(c, 'refresh_token');
      const isBlacklisted = await prisma.blacklist.findFirst({
        where: {
          id: refresh_token,
        },
      });
      if (isBlacklisted !== null) {
        deleteCookie(c, 'access_token');
        deleteCookie(c, 'refresh_token');
        return c.json({ message: 'Unauthorized' }, 401);
      }
      if (refresh_token === undefined) {
        return c.json({ message: 'Unauthorized' }, 401);
      }
      const payload = await verify(refresh_token, env.JWT_REFRESH_SECRET);
      const token = await sign(
        {
          user_id: payload.user_id,
          exp: Math.round(new Date().getTime() / 1000) + 60 * env.ACCESS_TOKEN_EXPIRES_MINUTES,
        },
        env.JWT_ACCESS_SECRET
      );
      c.set('user_id', payload.user_id);
      setCookie(c, 'access_token', token, {
        httpOnly: true,
        maxAge: 60 * 60 * env.ACCESS_TOKEN_EXPIRES_MINUTES,
      });
      return await next();
    }
    const payload = await verify(token, env.JWT_ACCESS_SECRET);
    c.set('user_id', payload.user_id);
  } catch (error) {
    console.error(error);
    if (error instanceof JwtTokenExpired) {
      const refresh_token = getCookie(c, 'refresh_token');

      if (refresh_token === undefined) {
        return c.json({ message: 'Unauthorized' }, 401);
      }
      try {
        const payload = await verify(refresh_token, env.JWT_REFRESH_SECRET);
        const token = await sign(
          {
            user_id: payload.user_id,
            exp: Math.round(new Date().getTime() / 1000) + 60 * env.ACCESS_TOKEN_EXPIRES_MINUTES,
          },
          env.JWT_ACCESS_SECRET
        );
        c.set('user_id', payload.user_id);
        setCookie(c, 'access_token', token, {
          httpOnly: true,
          maxAge: 60 * 60 * env.ACCESS_TOKEN_EXPIRES_MINUTES,
        });
        return await next();
      } catch (error) {
        deleteCookie(c, 'access_token');
        deleteCookie(c, 'refresh_token');
        console.error(error);
        return c.json({ message: 'Unauthorized' }, 401);
      }
    }
    deleteCookie(c, 'access_token');
    deleteCookie(c, 'refresh_token');
    return c.json({ message: 'Unauthorized' }, 401);
  }
  return await next();
});
