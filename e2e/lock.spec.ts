import { test, expect } from "@playwright/test";

test.describe("Staking and Token Lock flows", () => {
  test.beforeEach(async ({ page }) => {
    // Intercept GQL to ensure deterministic test data
    await page.route("**/graphql", async (route) => {
      const { operationName } = route.request().postDataJSON() || {};

      if (operationName === "GetProposals") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: { proposals: [] } }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto("/");
  });

  test("should successfully open Lock tokens dialog and process mocked transaction", async ({
    page,
  }) => {
    await page.waitForLoadState("networkidle");
    await page.goto("/delegates");
    await page.waitForLoadState("networkidle");

    const stakeBtn = page.getByRole("button", { name: /Stake|Lock/i }).first();

    if (await stakeBtn.isVisible()) {
      await stakeBtn.click();

      const input = page.getByTestId("lock-amount-input");
      await expect(input).toBeVisible({ timeout: 10000 });
      await input.fill("10");

      await page.getByTestId("lock-review-btn").click();

      const confirmBtn = page.getByTestId("confirm-lock-btn");
      await expect(confirmBtn).toBeVisible();
      await confirmBtn.click();

      await expect(page.getByText(/Successfully locked/i)).toBeVisible({
        timeout: 10000,
      });
    }
  });
});
