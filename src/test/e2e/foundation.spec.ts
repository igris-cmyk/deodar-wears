import { expect, test } from "@playwright/test";

test("root route loads without generic starter content", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Platform foundation active." }),
  ).toBeVisible();
  await expect(page.getByText("Get started by editing")).toHaveCount(0);
});

test("unknown route renders custom not-found", async ({ page }) => {
  const response = await page.goto("/unknown-phase-0-route");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "This route is not available." }),
  ).toBeVisible();
});

test("liveness endpoint succeeds and security headers exist", async ({ request }) => {
  const response = await request.get("/api/health/live");

  expect(response.ok()).toBe(true);
  expect(await response.json()).toEqual({ status: "ok" });
  expect(response.headers()["content-security-policy-report-only"]).toBeTruthy();
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
});

test("mobile viewport can render the root route", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.locator("main")).toBeVisible();
});
