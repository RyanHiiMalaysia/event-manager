import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(req) {
  try {
    const { name, email } = await req.json();

    // Connect to the Neon database
    const sql = neon(`${process.env.DATABASE_URL}`);

    // Check if the user already exists in the database
    const result = await sql('SELECT * FROM users WHERE user_email = $1', [email]);

    if (result.length > 0) {
      // User already exists
      return NextResponse.json({ message: 'User already exists. Please sign in.' }, { status: 400 });
    }

    // Insert the user details into the users table
    await sql('INSERT INTO users (user_name, user_email) VALUES ($1, $2)', [name, email]);

    // Respond with success
    return NextResponse.json({ message: 'User signed up successfully.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}