import "server-only";

import { ApplicationError } from "@/infrastructure/errors/application-error";

export type PaymentGateway = {
  createOrder(input: unknown): Promise<unknown>;
  fetchPayment(paymentId: string): Promise<unknown>;
  createRefund(input: unknown): Promise<unknown>;
  verifyCheckoutSignature(input: unknown): boolean;
  verifyWebhookSignature(rawBody: string, signature: string): boolean;
};

export class UnsupportedPaymentGateway implements PaymentGateway {
  public async createOrder(): Promise<unknown> {
    throw unavailable();
  }

  public async fetchPayment(): Promise<unknown> {
    throw unavailable();
  }

  public async createRefund(): Promise<unknown> {
    throw unavailable();
  }

  public verifyCheckoutSignature(): boolean {
    throw unavailable();
  }

  public verifyWebhookSignature(): boolean {
    throw unavailable();
  }
}

export const paymentGateway: PaymentGateway = new UnsupportedPaymentGateway();

function unavailable(): ApplicationError {
  return new ApplicationError({
    code: "PROVIDER_UNAVAILABLE",
    message: "Payment gateway is not configured for this phase.",
    status: 503,
    retryable: true,
  });
}
