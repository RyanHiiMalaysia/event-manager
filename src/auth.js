import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { neon } from '@neondatabase/serverless';

export const authOptions = {
  providers: [Google],
  callbacks: {
    async signIn({ user, account, profile }) {
      const sql = neon(`${process.env.DATABASE_URL}`);
      const email = user.email;

      // Check if the user already exists in the database
      const result = await sql('SELECT * FROM users WHERE user_email = $1', [email]);

      if (result.length === 0) {
        // Redirect to sign-up page if the user does not exist
        return '/signup';
      }

      return true;
    },
    async session({ session, token }) {
      const sql = neon(`${process.env.DATABASE_URL}`);
      const result = await sql('SELECT user_has_paid, user_name FROM users WHERE user_email = $1', [token.email]);

      if (result.length > 0) {
        session.user.user_has_paid = result[0].user_has_paid;
        session.user.chosenName = result[0].user_name; // Store user_name in session
      }

      return session;
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);