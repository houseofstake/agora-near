import { test, expect } from "@playwright/test";

test.describe("Voting Power Display & Rendering", () => {
  test.beforeEach(async ({ page }) => {
    // Log browser console to our terminal to debug
    page.on("console", (msg) =>
      console.log(`[Browser] ${msg.type()}: ${msg.text()}`)
    );
    page.on("pageerror", (err) =>
      console.log(`[Browser Error]: ${err.message}`)
    );

    // Intercept api.near.social so it doesn't hang in CI or rate limit
    await page.route("https://api.near.social/get", async (route, request) => {
      await route.fulfill({ status: 200, body: JSON.stringify({}) });
    });

    // Intercept RPC calls used by near-social fetching block
    await page.route("**/rpc/*", async (route, request) => {
      // Near RPC format returns a `result` object for successful queries
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ result: { result: [] } }),
      });
    });

    // Intercept other random API calls that might trigger React Query retries
    await page.route("**/api/delegates/*/*", async (route, request) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ count: 0, events: [], votes: [], data: [] }),
      });
    });

    // Intercept only the delegates API query to inject our base mock data
    await page.route("**/api/delegates*", async (route, request) => {
      const url = new URL(request.url());

      // Custom mock for searching
      if (url.searchParams.get("filter_by") === "dust") {
        return await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            count: 1,
            delegates: [
              { address: "dust.near", votingPower: "0", numOfDelegators: "0" },
            ],
          }),
        });
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          count: 3,
          delegates: [
            {
              address: "whale.near",
              votingPower: "15000000000000000000000000", // 15k NEAR
              numOfDelegators: "10",
            },
            {
              address: "dust.near",
              votingPower: "0", // 0 NEAR
              numOfDelegators: "0",
            },
            {
              address: "null-power.near",
              votingPower: null, // Null safety
              numOfDelegators: "2",
            },
          ],
        }),
      });
    });
  });

  test("should display Voting Power correctly in the Grid Layout (Cards)", async ({
    page,
  }) => {
    await page.goto("/delegates");

    // We verify the mock's 15k VP is rendered on the Grid layout
    const whaleCard = page.locator("a").filter({ hasText: "whale.near" });
    await expect(whaleCard).toBeVisible();
    await expect(whaleCard.getByText(/15/)).toBeVisible();

    // Verify Zero balance rendering correctly
    const dustCard = page.locator("a").filter({ hasText: "dust.near" });
    await expect(dustCard).toBeVisible();
    await expect(dustCard.getByText(/0/)).toBeVisible();

    // Verify Null VP rendering correctly (fallback to 0)
    const nullCard = page.locator("a").filter({ hasText: "null-power.near" });
    await expect(nullCard).toBeVisible();
    await expect(nullCard.getByText(/0/)).toBeVisible();
  });

  test("should safely render Voting Power for whales, zero balances, and null edge cases in the Delegate Table", async ({
    page,
  }) => {
    // Navigate to the Delegates page, ensuring the 'table' layout is active
    await page.goto("/delegates?layout=list");

    // Verify Whale rendering (15,000 NEAR)
    const whaleRow = page.locator("tr").filter({ hasText: "whale.near" });
    await expect(whaleRow).toBeVisible({ timeout: 60000 });
    await expect(whaleRow.getByText(/15/)).toBeVisible();

    // Verify Zero balance rendering
    const dustRow = page.locator("tr").filter({ hasText: "dust.near" });
    await expect(dustRow).toBeVisible();
    await expect(dustRow.getByText(/0/)).toBeVisible();

    // Verify Null VP rendering (typically handled as 0 or empty string based on UI mapping)
    const nullRow = page.locator("tr").filter({ hasText: "null-power.near" });
    await expect(nullRow).toBeVisible();
    await expect(nullRow.getByText("-", { exact: true })).toBeVisible();
  });

  test("should correctly navigate to a Delegate Profile via the Exact Address search bar", async ({
    page,
  }) => {
    // Intercept the specific delegate profile fetch
    await page.route("**/api/delegates/dust.near*", async (route, request) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          delegate: {
            address: "dust.near",
            votingPower: "0",
            numOfDelegators: "0",
            forCount: 0,
            againstCount: 0,
            abstainCount: 0,
          },
        }),
      });
    });

    await page.goto("/delegates");

    // Wait for initial load using the same locator that worked in grid view
    const whaleCard = page.locator("a").filter({ hasText: "whale.near" });
    await expect(whaleCard).toBeVisible();

    // The component forces "Exact address" placeholder and redirects to the profile Route on submit
    const searchInput = page.getByPlaceholder("Exact address");
    await searchInput.fill("dust.near");
    await searchInput.press("Enter");

    // Expected state: URL changes to the profile and dust profile info loads
    await page.waitForURL("**/delegates/dust.near");

    // We expect the "Delegated addresses" or Profile header to load
    await expect(page.getByText("Delegated addresses")).toBeVisible({
      timeout: 20000,
    });
  });

  test("should display Voting Power correctly on the Delegate Profile page", async ({
    page,
  }) => {
    // Intercept the specific delegate profile fetch
    await page.route("**/api/delegates/whale.near*", async (route, request) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          delegate: {
            address: "whale.near",
            votingPower: "500500000000000000000000000", // 500.5 NEAR
            delegatedFromCount: 42,
            forCount: 1,
            againstCount: 0,
            abstainCount: 0,
          },
        }),
      });
    });

    await page.goto("/delegates/whale.near");
    await page.waitForLoadState("domcontentloaded");

    // We expect the Stat Card for Voting Power to show 500.5 NEAR etc.
    await expect(page.getByText(/500\.5/)).toBeVisible({ timeout: 20000 });

    // Check that numOfDelegators rendered correctly underneath the specific PanelRow title
    await expect(
      page.getByText("Delegated addresses").locator("..").getByText("42")
    ).toBeVisible();
  });
});
