import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      organizationId?: string | null;
    };
  }

  interface User {
    id: string;
    email?: string | null;
    organizationId?: string | null;
  }

  interface NextAuthOptions {
    trustHost?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    organizationId?: string | null;
  }
}