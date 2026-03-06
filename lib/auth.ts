import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma_db } from "./prisma";
import { authConfig } from "./auth.config";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

// Extend session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
      isVerified: boolean;
      provider?: string;
    };
  }

  interface User {
    role: string;
    isVerified: boolean;
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma_db),
  ...authConfig,
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
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate credentials
          const { email, password } = loginSchema.parse(credentials);

          // Find user by email
          const user = await prisma_db.user.findUnique({
            where: { email },
          });

          if (!user || !user.password) {
            throw new Error("Invalid credentials");
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
            throw new Error("Invalid credentials");
          }

          // Check if user is verified
          if (!user.isVerified) {
            throw new Error("Please verify your email before logging in");
          }

          // Return user object
          return {
            id: user.id,
            email: user.email!,
            name: user.name,
            image: user.image,
            role: user.role,
            isVerified: user.isVerified,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      console.log("SignIn callback:", { user, account, provider: account?.provider });
      // Auto-verify OAuth users (Google, GitHub, etc.)
      if (account?.provider && account.provider !== "credentials" && user.email) {
        console.log("Verifying OAuth user:", user.email);

        // Check if a user with this email already exists
        const existingUser = await prisma_db.user.findUnique({
          where: { email: user.email },
          include: { accounts: true }
        });

        // If user exists but doesn't have this OAuth account linked, link it
        if (existingUser && !existingUser.accounts.find(acc => acc.provider === account.provider)) {
          console.log("Linking OAuth account to existing user");
          await prisma_db.account.create({
            data: {
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              token_type: account.token_type,
              scope: account.scope,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
            }
          });
          // Update user.id to the existing user's id for JWT callback
          user.id = existingUser.id;
        }

        // Download and upload OAuth profile picture to S3 (only for new users)
        let s3ImageUrl: string | null = null;
        if (user.image && !existingUser) {
          // Only upload avatar for NEW OAuth users, don't overwrite existing user's custom avatar
          try {
            console.log("Downloading OAuth profile picture:", user.image);
            const response = await fetch(user.image);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Import uploadToS3 dynamically to avoid circular deps
            const { uploadToS3 } = await import("./s3");
            s3ImageUrl = await uploadToS3(buffer, "profile.jpg");
            console.log("Uploaded to S3:", s3ImageUrl);
          } catch (error) {
            console.error("Failed to upload OAuth image to S3:", error);
            // Fall back to original OAuth image URL
            s3ImageUrl = user.image;
          }
        }

        // Only update isVerified and image for NEW users
        // Don't overwrite existing user's data on re-login
        if (!existingUser) {
          await prisma_db.user.updateMany({
            where: { email: user.email },
            data: {
              isVerified: true,
              ...(s3ImageUrl && { image: s3ImageUrl })
            },
          });
        } else {
          // Just mark as verified, don't touch other fields
          await prisma_db.user.updateMany({
            where: { email: user.email },
            data: {
              isVerified: true,
            },
          });
        }

        // Mark user as verified immediately in the user object
        user.isVerified = true;
        if (s3ImageUrl && !existingUser) {
          user.image = s3ImageUrl;
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isVerified = user.isVerified;

        // Store provider info to differentiate OAuth vs credentials
        if (account?.provider) {
          token.provider = account.provider;
          // OAuth users are always verified
          if (account.provider !== "credentials") {
            token.isVerified = true;
          }
        }
      }

      // Handle session updates (triggered by updateSession)
      if (trigger === "update") {
        // Fetch fresh user data from DB when session is updated
        const dbUser = await prisma_db.user.findUnique({
          where: { id: token.id as string },
          select: {
            name: true,
            email: true,
            image: true,
            role: true,
            isVerified: true
          },
        });

        if (dbUser) {
          token.name = dbUser.name;
          token.email = dbUser.email;
          // Add cache-busting timestamp to image URL
          token.picture = dbUser.image ? `${dbUser.image}?t=${Date.now()}` : dbUser.image;
          token.role = dbUser.role;
          token.isVerified = dbUser.isVerified;
        }

        return token;
      }

      // For credentials users, fetch fresh data from DB
      // For OAuth users, trust the token since they're auto-verified
      if (token.id && token.provider === "credentials") {
        const dbUser = await prisma_db.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, isVerified: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.isVerified = dbUser.isVerified;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
        session.user.role = token.role as string;
        session.user.isVerified = token.isVerified as boolean;
        session.user.provider = token.provider as string | undefined;
      }
      return session;
    },
  },
});
