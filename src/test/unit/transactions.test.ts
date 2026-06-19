import { beforeEach, describe, expect, it, vi } from "vitest";

const transaction = vi.fn();

vi.mock("@/infrastructure/database/prisma", () => ({
  prisma: {
    $transaction: transaction,
  },
}));

describe("commerce transaction", () => {
  beforeEach(() => {
    transaction.mockReset();
  });

  it("retries known serialization errors", async () => {
    const { withCommerceTransaction } =
      await import("@/infrastructure/transactions/commerce-transaction");
    transaction
      .mockRejectedValueOnce({ code: "40001" })
      .mockImplementationOnce(async (operation: (tx: unknown) => Promise<string>) =>
        operation({}),
      );

    await expect(
      withCommerceTransaction(async () => "ok", { maximumAttempts: 2 }),
    ).resolves.toBe("ok");
    expect(transaction).toHaveBeenCalledTimes(2);
  });

  it("does not retry validation errors", async () => {
    const { withCommerceTransaction } =
      await import("@/infrastructure/transactions/commerce-transaction");
    transaction.mockRejectedValueOnce(new Error("validation"));

    await expect(withCommerceTransaction(async () => "ok")).rejects.toThrow("validation");
    expect(transaction).toHaveBeenCalledTimes(1);
  });

  it("stops at configured maximum", async () => {
    const { withCommerceTransaction } =
      await import("@/infrastructure/transactions/commerce-transaction");
    transaction.mockRejectedValue({ code: "40001" });

    await expect(
      withCommerceTransaction(async () => "ok", { maximumAttempts: 2 }),
    ).rejects.toMatchObject({ code: "SERIALIZATION_RETRY_EXHAUSTED" });
    expect(transaction).toHaveBeenCalledTimes(2);
  });
});
