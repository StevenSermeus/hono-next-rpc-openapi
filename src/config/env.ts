import { z } from 'zod';

import { createEnv } from '@t3-oss/env-core';

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    PORT: z.coerce.number().default(3000),
    JWT_ACCESS_SECRET: z.string(),
    JWT_REFRESH_SECRET: z.string(),
    SALT_ROUNDS: z.coerce.number().default(10),
    COOKIE_SECRET: z.string(),
    REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().default(7),
    ACCESS_TOKEN_EXPIRES_MINUTES: z.coerce.number().default(15),
    WEBSITE_URL: z.string().url().default('http://localhost:3000'),
  },
  runtimeEnv: process.env,
  isServer: process.env.NODE_ENV === 'test' ? true : typeof window === 'undefined',
});
