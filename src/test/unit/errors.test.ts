import { describe, expect, it } from "vitest";

import { ApplicationError } from "@/infrastructure/errors/application-error";
import { mapErrorToSafeResponse } from "@/infrastructure/errors/map-error";

describe("error mapper", () => {
  it("hides internal details", () => {
    const mapped = mapErrorToSafeResponse(
      new Error("database password leaked in stack"),
      "ref-1",
      true,
    );

    expect(mapped.status).toBe(500);
    expect(mapped.error.message).not.toContain("password");
  });

  it("maps expected errors without leaking production internals", () => {
    const mapped = mapErrorToSafeResponse(
      new ApplicationError({
        code: "CONFLICT",
        message: "specific conflict",
        status: 409,
        expose: true,
      }),
      "ref-2",
      true,
    );

    expect(mapped.status).toBe(409);
    expect(mapped.error.message).toBe("The request conflicts with current state.");
  });
});
