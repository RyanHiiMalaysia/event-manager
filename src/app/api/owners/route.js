import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function fetchUserDetails(owner) {
  const sql = neon(`${process.env.DATABASE_URL}`);
  return await sql('SELECT user_name FROM users WHERE user_id = $1', [owner]);
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get('owner');

  if (!owner) {
    return NextResponse.json({ message: 'Owner is required' }, { status: 400 });
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await fetchUserDetails(owner);

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