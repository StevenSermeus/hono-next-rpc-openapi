import { z } from 'zod';

import { createEnv } from '@t3-oss/env-core';

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    PORT: z.coerce.number().default(3000),
    JWT_ACCESS_SECRET: z.string(),
    JWT_REFRESH_SECRET: z.string(),
    SALT_ROUNDS: z.coerce.number().default(10),
    REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().default(7),
    ACCESS_TOKEN_EXPIRES_MINUTES: z.coerce.number().default(15),
    WEBSITE_URL: z.string().url().default('http://localhost:3000'),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    PORT: process.env.PORT,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'access',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'refresh',
    SALT_ROUNDS: process.env.NODE_ENV === 'test' ? 10 : process.env.SALT_ROUNDS,
    REFRESH_TOKEN_EXPIRES_DAYS:
      process.env.NODE_ENV === 'test' ? 7 : process.env.REFRESH_TOKEN_EXPIRES_DAYS,
    ACCESS_TOKEN_EXPIRES_MINUTES:
      process.env.NODE_ENV === 'test' ? 15 : process.env.ACCESS_TOKEN_EXPIRES_MINUTES,
    WEBSITE_URL: process.env.WEBSITE_URL || 'http://localhost:3000',
  },
  skipValidation: process.env.NODE_ENV === 'test',
});
