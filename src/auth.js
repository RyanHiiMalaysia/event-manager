import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { neon } from '@neondatabase/serverless'
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user, account, profile }) {
      const sql = neon(`${process.env.DATABASE_URL}`);
      const email = user.email;
      const name = user.name;

      // Check if the user already exists in the database
      const result = await sql('SELECT * FROM users WHERE email = $1', [email]);

      if (result.length === 0) {
        // If the user does not exist, insert their details into the users table
        await sql('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email]);
      }

      return true;
    }
  }
});