import { rateLimiter } from 'hono-rate-limiter';

const rateLimiterMiddleware = ({
  windowMs,
  limit,
  key,
}: {
  windowMs: number;
  limit: number;
  key: string;
}) => {
  return rateLimiter({
    windowMs: windowMs,
    limit: limit,
    standardHeaders: 'draft-6',
    keyGenerator: c =>
      `${key}-${c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'anon'}`,
    message: {
      message: 'Rate limit exceeded',
    },
    statusCode: 429,
  });
};

export { rateLimiterMiddleware };
