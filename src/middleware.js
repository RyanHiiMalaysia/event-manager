import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function middleware(req) {
  const session = await auth();

  const userAgent = req.headers.get('user-agent') || '';
  const isBot = /bot|crawler|spider|crawling|facebook/i.test(userAgent);

  if (!session && !isBot) {
    // Redirect to signup page if user is not authenticated and not a bot
    return NextResponse.redirect(new URL('/signup', req.url));
  }

  const userHasPaid = session?.user?.user_has_paid;
  const userEventsCreated = session?.user?.user_events_created;
  const pathname = req.nextUrl.pathname;

  if (!userHasPaid && userEventsCreated >= 5 && pathname === '/event/create') {
    // Redirect to pricing page if user has not paid and has created 5 or more events
    return NextResponse.redirect(new URL('/pricing', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile', '/calendar', '/event/:path*'], // Add your protected routes here
};