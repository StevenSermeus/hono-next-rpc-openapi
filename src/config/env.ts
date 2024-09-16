import { z } from 'zod';

import { createEnv } from '@t3-oss/env-core';

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    JWT_ACCESS_SECRET: z.string(),
    JWT_REFRESH_SECRET: z.string(),
    REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().default(7),
    ACCESS_TOKEN_EXPIRES_MINUTES: z.coerce.number().default(15),
    WEBSITE_URL: z.string().url().default('http://localhost:3000'),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'access',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'refresh',
    REFRESH_TOKEN_EXPIRES_DAYS:
      process.env.NODE_ENV === 'test' ? 7 : process.env.REFRESH_TOKEN_EXPIRES_DAYS,
    ACCESS_TOKEN_EXPIRES_MINUTES:
      process.env.NODE_ENV === 'test' ? 15 : process.env.ACCESS_TOKEN_EXPIRES_MINUTES,
    WEBSITE_URL: process.env.WEBSITE_URL || 'http://localhost:3000',
  },
  skipValidation: process.env.NODE_ENV === 'test',
});
