import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  if (!token) {
    console.log('Redirecting to home page');
    return NextResponse.redirect(new URL('/pricing', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile', '/calendar', '/event/:path*'], // Add your protected routes here
};