import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';
import { poweredBy } from 'hono/powered-by';
import { secureHeaders } from 'hono/secure-headers';
import { handle } from 'hono/vercel';

import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import { apiReference } from '@scalar/hono-api-reference';

import { printMetrics, registerMetrics } from '@/backend/libs/prometheus';
import { authApp } from '@/backend/routes/auth';
import { healthRoute } from '@/backend/routes/health';
import { env } from '@/config/env';

export const dynamic = 'force-dynamic';

const app = new OpenAPIHono().basePath('/api');
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Projet name REST API',
    description:
      "To access protected routes, you need to login or register first. You don't need to provide the token in the request, it will be automatically added to the request headers.",
  },
  servers: [
    {
      url: env.WEBSITE_URL,
    },
  ],
  security: [
    {
      AccessToken: [],
      RefreshToken: [],
    },
  ],
});

app.use('*', poweredBy());
app.use('*', registerMetrics);

app.get('/metrics', printMetrics);
app.use(
  '*',
  cors({
    origin: env.WEBSITE_URL, // Allowed origin
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    maxAge: 86400,
    credentials: true,
  })
);

app.use(secureHeaders());

app.use(
  csrf({
    origin: env.WEBSITE_URL,
  })
);

app.get('/ui', swaggerUI({ url: '/api/doc', syntaxHighlight: true }));
app.get(
  '/scalar',
  apiReference({
    pageTitle: 'Projet name API Reference',
    layout: 'modern',
    defaultHttpClient: {
      targetKey: 'node',
      clientKey: 'fetch',
    },
    spec: {
      url: '/api/doc',
    },
  })
);

const routes = app.route('/auth', authApp).route('/', healthRoute);

app.openAPIRegistry.registerComponent('securitySchemes', 'AccessToken', {
  type: 'apiKey',
  in: 'http_only_cookie',
  scheme: 'none',
  name: 'access_token',
});

app.openAPIRegistry.registerComponent('securitySchemes', 'RefreshToken', {
  type: 'apiKey',
  in: 'http_only_cookie',
  scheme: 'none',
  name: 'refresh_token',
});

export const GET = handle(routes);
export const POST = handle(routes);
export const PUT = handle(routes);
export const DELETE = handle(routes);
export const PATCH = handle(routes);

export const hono = app;

export type AppRoutes = typeof routes;
