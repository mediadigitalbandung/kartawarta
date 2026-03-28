import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      avatar?: string | null;
    };
  }
  interface User {
    id: string;
    role: Role;
    avatar?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    avatar?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password diperlukan");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.isActive) {
          throw new Error("Email atau password salah");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Email atau password salah");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.avatar = user.avatar;
      }
      // Refresh role from DB on every request to ensure accuracy
      if (token.id && (trigger === "update" || !user)) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, name: true, avatar: true, isActive: true },
          });
          if (dbUser && dbUser.isActive) {
            token.role = dbUser.role;
            token.name = dbUser.name;
            token.avatar = dbUser.avatar;
          }
        } catch {
          // Silently fail — use cached token
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.avatar = token.avatar;
      if (token.name) session.user.name = token.name as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const EDITOR_ROLES: Role[] = [
  "SUPER_ADMIN",
  "CHIEF_EDITOR",
  "EDITOR",
];

const WRITER_ROLES: Role[] = [
  ...EDITOR_ROLES,
  "SENIOR_JOURNALIST",
  "JOURNALIST",
  "CONTRIBUTOR",
];

export function canPublishDirectly(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "CHIEF_EDITOR" || role === "SENIOR_JOURNALIST";
}

export function canApproveArticles(role: Role): boolean {
  return EDITOR_ROLES.includes(role);
}

export function canWriteArticles(role: Role): boolean {
  return WRITER_ROLES.includes(role);
}

export function canManageUsers(role: Role): boolean {
  return role === "SUPER_ADMIN";
}

export function canManageAds(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "CHIEF_EDITOR";
}
