import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function fetchUserDetails(email) {
  const sql = neon(`${process.env.DATABASE_URL}`);
  return await sql('SELECT * FROM users WHERE user_email = $1', [email]);
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ message: 'Email is required' }, { status: 400 });
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await fetchUserDetails(email);

      if (result.length === 0) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      const user = result[0];
      return NextResponse.json(user, { status: 200 });
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      }
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
}