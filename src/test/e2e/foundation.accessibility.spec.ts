import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("root route has no critical accessibility violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  const critical = results.violations.filter(
    (violation) => violation.impact === "critical",
  );

  expect(critical).toEqual([]);
});
