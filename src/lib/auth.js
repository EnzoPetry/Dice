import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
    },
    secret: process.env.BETTER_AUTH_SECRET,
    session: {
        maxAge: 60 * 60 * 24 * 30,
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    baseURL: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
    advanced: {
        useSecureCookies: true,
        cookies: {
            session_token: {
                name: "session_token",
                attributes: {
                    httpOnly: true,
                    sameSite: "lax",
                    path: "/",
                    secure: process.env.NODE_ENV === "production",
                    domain: process.env.NODE_ENV === "production"
                        ? ".projectdice.com.br"
                        : undefined,
                },
            },
        },
    },
});
