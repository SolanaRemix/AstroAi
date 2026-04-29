import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

const ADMIN_EMAIL = "gxqstudio@gmail.com";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as NextAuthOptions["adapter"],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (user.email === ADMIN_EMAIL) {
        await db.user.upsert({
          where: { email: ADMIN_EMAIL },
          update: { role: Role.ADMIN },
          create: {
            email: ADMIN_EMAIL,
            name: user.name,
            image: user.image,
            role: Role.ADMIN,
          },
        });
      }
      return true;
    },
    // With strategy:"database" the `user` parameter in the session callback IS the
    // persisted DB record provided by PrismaAdapter — no extra query needed.
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        // PrismaAdapter passes all DB columns; cast to access our custom `role` field.
        session.user.role =
          (user as typeof user & { role: Role }).role ?? Role.USER;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "database",
  },
};
