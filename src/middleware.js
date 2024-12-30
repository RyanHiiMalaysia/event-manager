import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function middleware(req) {
  const session = await auth();

  if (!session) {
    // Redirect to pricing page if user is not authenticated
    return NextResponse.redirect(new URL('/signUp', req.url));
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