import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

// Notice we don't import prisma or any Node.js modules here
export const authConfig = {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),
        Credentials({
            // The authorize function will be provided in auth.ts
            // because it needs Prisma which is not Edge-compatible.
        }),
    ],
    pages: {
        signIn: "/auth/login",
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isDashboard = nextUrl.pathname.startsWith("/dashboard");
            const isOnboarding = nextUrl.pathname.startsWith("/onboarding");
            const isProtected = isDashboard || isOnboarding;

            if (isProtected) {
                if (isLoggedIn) return true;
                return false; // Redirect to login
            }
            return true;
        },
    },
} satisfies NextAuthConfig;
