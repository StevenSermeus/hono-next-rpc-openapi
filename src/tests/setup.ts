import { execSync } from 'child_process';
import { config } from 'dotenv';
import { afterAll, beforeAll } from 'vitest';

import { PrismaClient } from '@prisma/client';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';

//eslint-disable-next-line
import prisma from '@/backend/libs/prisma';

let container: StartedPostgreSqlContainer;

beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:16').start();
  const url = container.getConnectionUri();
  process.env.DATABASE_URL_TEST = url;
  //exec with zsh shell
  execSync(`npx prisma db push`, {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: url,
    },
  });

  config({
    path: '.env.test',
  });
  //@ts-expect-error - we are setting the DATABASE_URL_TEST
  prisma = new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
  });
  //for CI/CD it's slower so we need to increase the timeout
}, 100000);

afterAll(async () => {
  await container.stop();
});
