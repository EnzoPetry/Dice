import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    secret: process.env.BETTER_AUTH_SECRET,
    session: {
        maxAge: 60 * 60 * 24 * 30,
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    baseURL: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
});
