import { execSync } from 'child_process';
import type { GlobalSetupContext } from 'vitest/node';

import { PrismaClient } from '@prisma/client';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';

//eslint-disable-next-line
import prisma from '@/backend/libs/prisma';

let container: StartedPostgreSqlContainer;

declare module 'vitest' {
  export interface ProvidedContext {
    DATABASE_URL: string;
  }
}

export const setup = async ({ provide }: GlobalSetupContext) => {
  container = await new PostgreSqlContainer('postgres:16').start();
  const url = container.getConnectionUri();
  process.env.DATABASE_URL_TEST = url;
  //exec with zsh shell
  execSync(`npx prisma db push --skip-generate`, {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: url,
    },
  });
  provide('DATABASE_URL', url);
  //@ts-expect-error - we are setting the DATABASE_URL_TEST
  prisma = new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
  });
  //for CI/CD it's slower so we need to increase the timeout
};

export const teardown = async () => {
  await container.stop();
};
