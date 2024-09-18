import { handle } from 'hono/vercel';

import { hono } from '@/backend';

export const dynamic = 'force-dynamic';

export const GET = handle(hono);
export const POST = handle(hono);
export const PUT = handle(hono);
export const DELETE = handle(hono);
export const PATCH = handle(hono);
