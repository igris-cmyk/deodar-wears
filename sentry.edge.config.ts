import * as Sentry from "@sentry/nextjs";

if (process.env.SENTRY_DSN && process.env.APP_ENV !== "test") {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.APP_ENV,
    tracesSampleRate: 0,
  });
}
