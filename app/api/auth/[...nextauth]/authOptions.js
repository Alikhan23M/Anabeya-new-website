import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

const authOptions = {
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        await dbConnect();

        // Handle Google sign-in
        if (account?.provider === "google") {
          let dbUser = await User.findOne({ email: user.email });

          if (!dbUser) {
            dbUser = await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              provider: "google",
              isAdmin: false,
            });
            console.log("Created new Google user:", dbUser);
          } else {
            dbUser.image = user.image;
            dbUser.provider = "google";
            await dbUser.save();
            console.log("Updated existing user:", dbUser);
          }
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false; // safer to block sign in if DB fails
      }
    },

    async jwt({ token, user }) {
      if (user) {
        console.log("JWT callback:", user);
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.isAdmin = user.isAdmin || false;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
       
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.isAdmin = token.isAdmin || false;
      }
      if (session?.user) {
        try {
          await dbConnect();
          const dbUser = await User.findOne({ email: session.user.email });

          if (dbUser) {
            session.user.id = dbUser._id.toString();
            session.user.isAdmin = dbUser.isAdmin || false;
            session.user.image = dbUser.image || session.user.image;
          }
        } catch (error) {
          console.error("Error in session callback:", error);
        }
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Admin login
        if (
          console.log("Admin login attempt:", credentials.email),
          credentials.email === process.env.ADMIN_EMAIL &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          return {
            id: 'admin',
            name: 'Admin',
            email: process.env.ADMIN_EMAIL,
            isAdmin: true,
          };
        }

        // Normal user login
        await dbConnect();
        const user = await User.findOne({ email: credentials.email });
        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin || false,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
