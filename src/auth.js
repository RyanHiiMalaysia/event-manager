import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { neon } from '@neondatabase/serverless';

export const authOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [Google],
  callbacks: {
    async signIn({ user, account, profile }) {
      const sql = neon(`${process.env.DATABASE_URL}`);
      const email = user.email;

      // Check if the user already exists in the database
      const result = await sql('SELECT * FROM users WHERE user_email = $1', [email]);

      if (result.length === 0) {
        // Redirect to sign-up page if the user does not exist
        return '/signUp';
      }

      return true;
    }
  }
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);