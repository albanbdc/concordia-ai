// src/auth.ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (!user) return null
        const ok = await bcrypt.compare(
  credentials.password,
  user.passwordHash || ""
)

        if (!ok) return null
        return { id: user.id, email: user.email }
      },
    }),
  ],
  pages: { signIn: "/login" },
})
