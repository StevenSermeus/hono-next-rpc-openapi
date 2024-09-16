import { beforeAll } from 'vitest';
import { inject } from 'vitest';

import { PrismaClient } from '@prisma/client';

//eslint-disable-next-line
import prisma from '@/backend/libs/prisma';

beforeAll(() => {
  const db = inject('DATABASE_URL');

  //@ts-expect-error - we are setting the DATABASE_URL_TEST
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: db,
      },
    },
  });
});
