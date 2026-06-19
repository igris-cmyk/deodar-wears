import { describe, expect, it } from "vitest";

import { createEmailProvider } from "@/infrastructure/email/provider";
import { paymentGateway } from "@/infrastructure/payments/gateway";
import { DevelopmentRateLimitProvider } from "@/infrastructure/rate-limit/provider";

describe("provider boundaries", () => {
  it("payment adapter fails clearly when unconfigured", async () => {
    await expect(paymentGateway.createOrder({})).rejects.toMatchObject({
      code: "PROVIDER_UNAVAILABLE",
    });
  });

  it("email provider does not fake production success", async () => {
    await expect(
      createEmailProvider("production").send({
        to: "a@example.com",
        from: "b@example.com",
        subject: "hello",
        html: "<p>hello</p>",
      }),
    ).rejects.toMatchObject({ code: "PROVIDER_UNAVAILABLE" });
  });

  it("development rate-limit adapter is deterministic", async () => {
    const provider = new DevelopmentRateLimitProvider();
    const first = await provider.check({ policy: "auth.password-reset", key: "ip" });
    const second = await provider.check({ policy: "auth.password-reset", key: "ip" });

    expect(first.remaining).toBeGreaterThan(second.remaining);
  });
});
