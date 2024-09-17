import { rateLimiter } from 'hono-rate-limiter';
import { z } from 'zod';

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

const rateLimitOpenApiResponse = {
  429: {
    description: 'Rate limit exceeded',
    content: {
      'application/json': {
        schema: z.object({
          message: z.string(),
        }),
      },
    },
  },
};

export { rateLimiterMiddleware, rateLimitOpenApiResponse };
