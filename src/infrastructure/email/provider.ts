import "server-only";

import { ApplicationError } from "@/infrastructure/errors/application-error";

export type SendEmailInput = {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
};

export type SendEmailResult = {
  providerMessageId: string;
};

export type EmailProvider = {
  send(input: SendEmailInput): Promise<SendEmailResult>;
};

export class DevelopmentEmailProvider implements EmailProvider {
  public async send(input: SendEmailInput): Promise<SendEmailResult> {
    return {
      providerMessageId: `dev-${input.to}-${input.subject}`.slice(0, 120),
    };
  }
}

export class UnconfiguredEmailProvider implements EmailProvider {
  public async send(): Promise<SendEmailResult> {
    throw new ApplicationError({
      code: "PROVIDER_UNAVAILABLE",
      message: "Email provider is not configured.",
      status: 503,
      retryable: true,
    });
  }
}

export function createEmailProvider(appEnv = process.env.APP_ENV): EmailProvider {
  if (appEnv === "local" || appEnv === "test") {
    return new DevelopmentEmailProvider();
  }

  return new UnconfiguredEmailProvider();
}
