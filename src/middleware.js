import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';



export async function middleware(req) {
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

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile', '/calendar', '/event/:path*'], // Add your protected routes here
};