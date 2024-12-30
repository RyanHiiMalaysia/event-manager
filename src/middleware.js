import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { auth } from '@/auth';

export async function middleware(req) {
  const session = await auth();
  const secret = process.env.AUTH_SECRET;
  const token = await getToken({
    req: req,
    secret: secret,
    secureCookie: process.env.NODE_ENV === 'production' ? true : false 
  });

  if (!token) {
    // Redirect to pricing page if user is not authenticated
    return NextResponse.redirect(new URL('/pricing', req.url));
  }

  const userHasPaid = session.user.user_has_paid;

  const pathname = req.nextUrl.pathname;

  if (!userHasPaid && (pathname.startsWith('/calendar') || pathname.startsWith('/event'))) {
    // Redirect to pricing page if user has not paid and is trying to access calendar or event pages
    return NextResponse.redirect(new URL('/pricing', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile', '/calendar', '/event/:path*'], // Add your protected routes here
};