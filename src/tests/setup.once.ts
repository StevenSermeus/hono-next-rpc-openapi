import { execSync } from 'child_process';
import type { GlobalSetupContext } from 'vitest/node';

import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';

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
  //exec with current shell to init the created database
  execSync(`npx prisma db push --skip-generate`, {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: url,
    },
  });
  provide('DATABASE_URL', url);
};

export const teardown = async () => {
  await container.stop();
};
