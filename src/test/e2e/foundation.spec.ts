import { expect, test } from "@playwright/test";

test("homepage renders catalog storefront content", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Made for the weather between forecasts." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Quiet pieces, built for repeat wear." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "A wardrobe that moves with the year." }),
  ).toBeVisible();
  for (const name of [
    "Spring Edit",
    "Summer Edit",
    "Rain & Transition",
    "Autumn Edit",
    "Winter Edit",
  ]) {
    await expect(page.getByRole("heading", { name })).toBeVisible();
  }
  await expect(page.getByText("Get started by editing")).toHaveCount(0);
});

test("seasonal collection links produce bounded catalog filters", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "The filter contract only needs one browser execution.");
  test.setTimeout(120_000);

  for (const slug of [
    "spring-edit",
    "summer-edit",
    "rain-transition",
    "autumn-edit",
    "winter-edit",
  ]) {
    await page.goto(`/shop?collection=${slug}`);
    await expect(page.getByLabel("Collection")).toHaveValue(slug);
    await expect(page.getByText(/^[1-9]\d* active products$/)).toBeVisible();
  }
});

test("create-account fits a common desktop viewport without clipping", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Desktop document overflow is the regression under test.");
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/auth/register");

  await expect(
    page.getByRole("heading", { name: "Create your Deodar Wears account." }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
  await expect(page.getByLabel("Name")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Confirm password")).toBeVisible();

  const geometry = await page.evaluate(() => ({
    viewportHeight: window.innerHeight,
    documentHeight: document.documentElement.scrollHeight,
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));

  expect(geometry.documentHeight).toBeLessThanOrEqual(geometry.viewportHeight);
  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
});

test("create-account remains naturally scrollable and reachable on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/auth/register");

  const submit = page.getByRole("button", { name: "Create account" });
  await submit.scrollIntoViewIfNeeded();
  await expect(submit).toBeVisible();
  await page.getByLabel("Email").focus();
  await expect(page.getByLabel("Email")).toBeFocused();
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
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("dialog", { name: "Mobile navigation" })).toBeVisible();
});

test("user browses shop and filters by category", async ({ page }) => {
  await page.goto("/shop");

  await expect(page.getByRole("heading", { name: "Catalog" })).toBeVisible();
  await page.getByLabel("Category").selectOption("outerwear");
  await page.getByRole("button", { name: "Apply filters" }).click();

  await expect(page).toHaveURL(/category=outerwear/);
  await expect(page.getByText("Alpine Field Jacket")).toBeVisible();
});

test("product detail loads and variant selection works", async ({ page }) => {
  await page.goto("/products/deodar-overshirt");

  await expect(page.getByRole("heading", { name: "Deodar Overshirt" })).toBeVisible();
  await page.getByRole("button", { name: "L", exact: true }).click();
  await expect(page.getByText("Black / L")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Checkout opens in a later phase" }),
  ).toBeDisabled();
});

test("mobile catalog renders", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/shop");

  await expect(page.getByRole("heading", { name: "Catalog" })).toBeVisible();
  await expect(page.getByText("active products")).toBeVisible();
});

test("unknown product returns not found", async ({ page }) => {
  const response = await page.goto("/products/not-a-real-product");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "This route is not available." }),
  ).toBeVisible();
});
