import { OpenAPIHono } from '@hono/zod-openapi';

import { loginRoute } from './login';
import { logoutRoute } from './logout';
import { meRoute } from './me';
import { registerRoute } from './register';

const authRoutes = new OpenAPIHono();

export const authApp = authRoutes
  .route('/', loginRoute)
  .route('/', logoutRoute)
  .route('/', meRoute)
  .route('/', registerRoute);
