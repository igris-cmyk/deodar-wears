import "server-only";

import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins";

import { createEmailProvider } from "@/infrastructure/email/provider";
import { logger } from "@/infrastructure/logging/logger";

import { prisma } from "@/infrastructure/database/prisma";

const appEnv = process.env.APP_ENV ?? "local";
const appUrl = process.env.APP_URL ?? "http://localhost:3000";
const authUrl = process.env.BETTER_AUTH_URL ?? appUrl;
const authSecret =
  process.env.BETTER_AUTH_SECRET ??
  (appEnv === "production" || appEnv === "staging"
    ? undefined
    : "deodar-wears-local-development-auth-secret-change-before-production");
const emailProvider = createEmailProvider(appEnv);

if (!authSecret) {
  throw new Error("BETTER_AUTH_SECRET is required outside local/test/preview.");
}

export const auth = betterAuth({
  appName: "Deodar Wears",
  baseURL: authUrl,
  secret: authSecret,
  trustedOrigins: [appUrl],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
    transaction: true,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    maxPasswordLength: 256,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await emailProvider.send({
        to: user.email,
        from: "security@deodarwears.com",
        subject: "Reset your Deodar Wears password",
        text: `Use this secure link to choose a new password: ${url}`,
        html: `<p>Use this secure link to choose a new password.</p><p><a href="${url}">Reset password</a></p>`,
      });
      logger.info({ event: "security.password_reset_requested" });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await emailProvider.send({
        to: user.email,
        from: "security@deodarwears.com",
        subject: "Verify your Deodar Wears email",
        text: `Verify your email address: ${url}`,
        html: `<p>Verify your email address.</p><p><a href="${url}">Verify email</a></p>`,
      });
      logger.info({ event: "security.verification_email_requested" });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    freshAge: 60 * 10,
  },
  plugins: [
    twoFactor({
      issuer: "Deodar Wears",
      skipVerificationOnEnable: false,
      backupCodeOptions: {
        amount: 10,
        length: 12,
        storeBackupCodes: "encrypted",
      },
    }),
    nextCookies(),
  ],
});
