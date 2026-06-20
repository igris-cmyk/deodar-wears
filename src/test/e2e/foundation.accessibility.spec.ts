import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const publicRoutes = [
  "/",
  "/shop",
  "/products/deodar-overshirt",
  "/auth/register",
] as const;

test.describe.configure({ mode: "serial" });

for (const route of publicRoutes) {
  test(`${route} has no critical accessibility violations`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto(route, { waitUntil: "domcontentloaded", timeout: 60_000 });
    const results = await new AxeBuilder({ page }).analyze();
    const critical = results.violations.filter(
      (violation) => violation.impact === "critical",
    );

    expect(critical).toEqual([]);
  });
}
