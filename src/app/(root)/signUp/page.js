import { neon } from '@neondatabase/serverless';

export default function SignUp() {
  async function handleSignUp(formData) {
    'use server';
    const email = formData.get('email');
    const name = formData.get('name');

    // Connect to the Neon database
    const sql = neon(`${process.env.DATABASE_URL}`);

    // Check if the user already exists in the database
    const result = await sql('SELECT * FROM users WHERE email = $1', [email]);

    if (result.length > 0) {
      // User already exists, redirect to the home page or show an error message
      return { error: 'User already exists. Please sign in.' };
    }

    // Insert the user details into the users table
    await sql('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email]);

    // Redirect to the home page after sign-up
    return { success: true };
  }

  return (
    <form action={handleSignUp}>
      <input type="text" placeholder="Name" name="name" required />
      <input type="email" placeholder="Email" name="email" required />
      <button type="submit">Sign Up</button>
    </form>
  );
}