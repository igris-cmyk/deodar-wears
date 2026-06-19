import { beforeEach, describe, expect, it, vi } from "vitest";

const findUnique = vi.fn();
const upsert = vi.fn();

vi.mock("@/infrastructure/database/prisma", () => ({
  prisma: {
    idempotencyRecord: {
      findUnique,
      upsert,
    },
  },
}));

describe("idempotency service", () => {
  beforeEach(() => {
    findUnique.mockReset();
    upsert.mockReset();
  });

  it("first execution succeeds", async () => {
    const { runIdempotent } = await import("@/infrastructure/idempotency/service");
    findUnique.mockResolvedValueOnce(null);

    const result = await runIdempotent({
      scope: "test",
      key: "key-1",
      request: { a: 1 },
      ttlMs: 60_000,
      operation: async () => ({ status: 200, body: { ok: true } }),
    });

    expect(result.status).toBe("created");
    expect(upsert).toHaveBeenCalledOnce();
  });

  it("exact retry returns original result", async () => {
    const { hashRequest, runIdempotent } =
      await import("@/infrastructure/idempotency/service");
    findUnique.mockResolvedValueOnce({
      requestHash: hashRequest({ a: 1 }),
      responseBody: { ok: true },
      expiresAt: new Date(Date.now() + 60_000),
    });

    const result = await runIdempotent({
      scope: "test",
      key: "key-1",
      request: { a: 1 },
      ttlMs: 60_000,
      operation: async () => ({ status: 200, body: { ok: false } }),
    });

    expect(result).toEqual({ status: "replayed", value: { ok: true } });
  });

  it("conflicting retry fails", async () => {
    const { hashRequest, runIdempotent } =
      await import("@/infrastructure/idempotency/service");
    findUnique.mockResolvedValueOnce({
      requestHash: hashRequest({ a: 1 }),
      responseBody: { ok: true },
      expiresAt: new Date(Date.now() + 60_000),
    });

    await expect(
      runIdempotent({
        scope: "test",
        key: "key-1",
        request: { a: 2 },
        ttlMs: 60_000,
        operation: async () => ({ status: 200, body: { ok: false } }),
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });
});
