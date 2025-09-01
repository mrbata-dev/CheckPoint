import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getPrisma } from "./prisma";
import type { User } from "next-auth";

const prisma = getPrisma();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
    async authorize(credentials): Promise<User | null> {
  if (!credentials?.email || !credentials?.password) return null;

  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
  });

  if (user && user.password === credentials.password) {
    return {
      id: user.id.toString(),
      name: user.name ?? null,
      email: user.email,
    };
  }

  return null;
}

    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
};
