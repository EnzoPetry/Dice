import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";
import { sendVerificationEmails, sendResetPasswordEmail } from "./email.js";

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
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url, token }, request) => {
            try {
                const result = await sendResetPasswordEmail(
                    user.email,
                    token,
                    user.name
                );

                console.log(result);
                if (!result.success) {
                    console.warn(`Falha ao enviar e-mail de alteração de senha para ${user.email}`);
                } else {
                    console.log(`E-mail de alteração de senha enviado para ${user.email}`);
                }

                return result;
            } catch (error) {
                console.error("Erro ao enviar e-mail de alteração de senha");
                throw new Error("Falha ao enviar e-mail de alteração de senha");
            }
        },
    },
    emailVerification: {
        sendOnSignUp: true,
        expiresIn: 24 * 60 * 60,
        autoSignInAfterVerification: false,
        sendVerificationEmail: async ({ user, url, token }) => {
            try {
                const result = await sendVerificationEmails(
                    user.email,
                    token,
                    user.name
                );

                if (!result.success) {
                    console.warn(`Falha ao enviar e-mail de verificação para ${user.email}`);
                } else {
                    console.log(`E-mail de verificação enviado para ${user.email}`);
                }

                return result;
            } catch (error) {
                console.error("Erro ao enviar e-mail de verificação");
                throw new Error("Falha ao enviar e-mail de verificação");
            }
        },
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