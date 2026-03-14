import { test, expect } from '@playwright/test';

test.describe('Voting Power Display & Rendering', () => {

  test.beforeEach(async ({ page }) => {
    // Intercept only the delegates API query to inject our base mock data
    await page.route(/\/api\/delegates(\?.*)?$/, async (route, request) => {
        const url = new URL(request.url());
        
        // Custom mock for searching
        if (url.searchParams.get('filter_by') === 'dust') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              count: 1,
              delegates: [
                { address: "dust.near", votingPower: "0", numOfDelegators: "0" }
              ]
            })
          });
          return;
        }

        // Default mock for all other delegate list fetches (Grid, Table)
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            count: 3,
            delegates: [
              {
                address: "whale.near",
                votingPower: "15000000000000000000000000", // 15k NEAR
                numOfDelegators: "10"
              },
              {
                address: "dust.near",
                votingPower: "0",     // 0 NEAR
                numOfDelegators: "0"
              },
              {
                address: "null-power.near",
                votingPower: null,    // Null safety
                numOfDelegators: "2"
              }
            ]
          })
        });
    });
  });

  test('should display Voting Power correctly in the Grid Layout (Cards)', async ({ page }) => {
    // Default /delegates renders Grid layout
    await page.goto('/delegates');
    
    // Cards usually contain headings or links pointing to the profile
    const whaleCard = page.locator('a[href="/delegates/whale.near"]');
    await expect(whaleCard).toBeVisible({ timeout: 60000 });
    
    // Check if 15k is inside the card
    await expect(whaleCard.locator('..').getByText(/15/)).toBeVisible();

    // Check dust card rendering 0 safely
    const dustCard = page.locator('a[href="/delegates/dust.near"]');
    await expect(dustCard).toBeVisible();
    await expect(dustCard.locator('..').getByText(/0/)).toBeVisible();
    
    // Check null-power card rendering safely
    const nullCard = page.locator('a[href="/delegates/null-power.near"]');
    await expect(nullCard).toBeVisible();
  });

  test('should safely render Voting Power for whales, zero balances, and null edge cases in the Delegate Table', async ({ page }) => {
    // Navigate with layout=list to trigger DelegateTable
    await page.goto('/delegates?layout=list');

    // Verify Whale rendering (15,000 NEAR)
    const whaleRow = page.locator('tr').filter({ hasText: 'whale.near' });
    await expect(whaleRow).toBeVisible({ timeout: 60000 });
    await expect(whaleRow.getByText(/15/)).toBeVisible();

    // Verify Zero balance rendering
    const dustRow = page.locator('tr').filter({ hasText: 'dust.near' });
    await expect(dustRow.locator('td').filter({ hasText: '0' })).toBeVisible();

    // Verify Null balance handling (safety check)
    const nullRow = page.locator('tr').filter({ hasText: 'null-power.near' });
    await expect(nullRow).toBeVisible();
  });

  test('should correctly navigate to a Delegate Profile via the Exact Address search bar', async ({ page }) => {
    // We must mock the profile route because the search bar navigates to it
    await page.route(/\/api\/delegates\/dust\.near(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          delegate: { address: "dust.near", votingPower: "0", numOfDelegators: "0" }
        })
      });
    });

    await page.goto('/delegates');
    
    // Wait for initial load
    await expect(page.locator('a[href="/delegates/whale.near"]')).toBeVisible();

    // The component forces "Exact address" placeholder and redirects to the profile Route on submit
    const searchInput = page.getByPlaceholder('Exact address');
    await searchInput.fill('dust.near');
    await searchInput.press('Enter');

    // Expected state: URL changes to the profile and dust profile info loads
    await page.waitForURL('http://localhost:3000/delegates/dust.near');
    // We expect the "Delegated addresses" or Profile header to load
    await expect(page.getByText('Delegated addresses')).toBeVisible({ timeout: 60000 });
  });

  test('should display Voting Power correctly on the Delegate Profile page', async ({ page }) => {
    // Intercept the specific delegate profile fetch
    await page.route(/\/api\/delegates\/whale\.near(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          delegate: {
            address: "whale.near",
            votingPower: "500500000000000000000000000", // 500.5 NEAR
            delegatedFromCount: "42"
          }
        })
      });
    });

    await page.goto('/delegates/whale.near');
    await page.waitForLoadState('domcontentloaded');

    // We expect the Stat Card for Voting Power to show 500.5 NEAR etc.
    await expect(page.getByText(/500\.5/)).toBeVisible({ timeout: 60000 });
    // Check that numOfDelegators rendered correctly underneath the specific PanelRow title
    await expect(page.getByText('Delegated addresses').locator('..').getByText('42')).toBeVisible();
  });
});
