import { deleteCookie, getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';
import { JwtTokenExpired } from 'hono/utils/jwt/types';

import { env } from '@/backend/config/env';
import { AuthorizedCounter, UnauthorizedCounter } from '@/libs/prometheus';

export const protectedRoute = createMiddleware(async (c, next) => {
  const access_token = getCookie(c, 'access_token');
  if (!access_token) {
    return c.json({ message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const payload = (await verify(access_token, env.JWT_ACCESS_SECRET)) as { user_id: string };
    c.set('user_id', payload.user_id);
  } catch (e) {
    if (e instanceof JwtTokenExpired) {
      deleteCookie(c, 'access_token');
      UnauthorizedCounter.inc(1);
      return c.json({ message: 'Unauthorized' }, { status: 401 });
    }
  }
  AuthorizedCounter.inc(1);
  return next();
});
