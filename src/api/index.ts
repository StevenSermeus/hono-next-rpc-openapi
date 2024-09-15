import { hc } from 'hono/client';

import type { AppRoutes } from '@/app/api/[[...route]]/route';

export const client = hc<AppRoutes>('http://localhost:3000', {
  init: {
    credentials: 'include',
  },
});
