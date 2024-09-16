import { OpenAPIHono } from '@hono/zod-openapi';

import { loginRoute } from './login';
import { logoutRoute } from './logout';
import { meRoute } from './me';
import { registerRoute } from './register';
import { renewRoute } from './renew';

const authRoutes = new OpenAPIHono();

export const authApp = authRoutes
  .route('/', loginRoute)
  .route('/token', logoutRoute)
  .route('/', meRoute)
  .route('/', registerRoute)
  .route('/token', renewRoute);
