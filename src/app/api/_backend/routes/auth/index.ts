import { OpenAPIHono } from '@hono/zod-openapi';

import { defaultHook } from '@/backend/middleware/zod-handle';

import { loginRoute } from './login';
import { logoutRoute } from './logout';
import { meRoute } from './me';
import { registerRoute } from './register';
import { renewRoute } from './renew';

export const authApp = new OpenAPIHono({
  defaultHook: defaultHook,
})
  .route('/', loginRoute)
  .route('/token', logoutRoute)
  .route('/', meRoute)
  .route('/', registerRoute)
  .route('/token', renewRoute);
