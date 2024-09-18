import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { verify } from 'hono/jwt';

import { env } from '@/config/env';

//the redirect need to be adapted depending on the project
export async function middleware(request: NextRequest) {
  const access_token = request.cookies.get('access_token');
  if (!access_token) {
    return NextResponse.redirect(
      `${request.nextUrl.origin}/redirect?redirect=${request.nextUrl.pathname}`
    );
  }
  try {
    const payload = (await verify(access_token.value, env.JWT_ACCESS_SECRET)) as {
      user_id: string;
      exp: number;
    };
    if (!payload.user_id) {
      return NextResponse.redirect(
        `${request.nextUrl.origin}/redirect?redirect=${request.nextUrl.pathname}`
      );
    }
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(
      `${request.nextUrl.origin}/redirect?redirect=${request.nextUrl.pathname}`
    );
  }
  return NextResponse.next();
}

// Add all pages that need the user to be authenticated
export const config = {
  matcher: ['/home'],
};
