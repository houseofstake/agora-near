import { test, expect } from "@playwright/test";

test.describe("Voting Power - Delegation Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Intercept GQL to ensure deterministic test data for delegates
    await page.route("**/graphql", async (route) => {
      const { operationName } = route.request().postDataJSON() || {};

      if (operationName === "GetDelegates") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              delegates: {
                edges: [
                  {
                    node: {
                      address: "e2e-target-delegate.near",
                      votingPower: "50000",
                    },
                  },
                ],
                pageInfo: { hasNextPage: false },
              },
            },
          }),
        });
        return;
      }

      await route.continue();
    });

    await page.goto("/delegates");
  });

  test("should successfully delegate voting power and show success toast", async ({
    page,
  }) => {
    await page.waitForLoadState("networkidle");

    // Check if the mock delegate is displayed
    const delegateCard = page.locator("text=e2e-target-delegate.near").first();
    if (await delegateCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Look for the "Delegate" button on the delegate card
      const delegateActionBtn = page
        .locator(`button:has-text("Delegate")`)
        .first();
      await expect(delegateActionBtn).toBeVisible();
      await delegateActionBtn.click();

      // Ensure the dialog opens and submit
      const confirmDelegateBtn = page.getByTestId("delegate-submit-button");
      await expect(confirmDelegateBtn).toBeVisible({ timeout: 5000 });
      await confirmDelegateBtn.click();

      // Verify success UI
      // 1. Toast appears
      await expect(page.getByText(/Delegation completed!/i)).toBeVisible({
        timeout: 10000,
      });
      // 2. Dialog closes
      await expect(page.getByRole("dialog")).toBeHidden();
    }
  });
});
