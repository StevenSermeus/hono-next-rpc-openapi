import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { verify } from 'hono/jwt';

import { env } from '@/config/env';

//the redirect need to be adapted depending on the project
export async function middleware(request: NextRequest) {
  const access_token = request.cookies.get('access_token');
  console.log('access_token', access_token);
  if (!access_token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const payload = (await verify(access_token.value, env.JWT_ACCESS_SECRET)) as {
      user_id: string;
      exp: number;
    };
    console.log('payload', new Date(payload.exp * 1000));
    if (!payload.user_id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.next();
}

// Add all pages that need the user to be authenticated
export const config = {
  matcher: ['/home'],
};
