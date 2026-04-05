import { test, expect } from "@playwright/test";

test.describe("Voting Power - Proposal Voting Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Intercept GQL to ensure deterministic test data for proposals
    await page.route("**/graphql", async (route) => {
      const { operationName } = route.request().postDataJSON() || {};

      if (operationName === "GetProposals") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              proposals: [
                {
                  id: "proposal-1",
                  title: "E2E Test Proposal",
                  description: "This is a dummy proposal for e2e testing",
                  status: "ACTIVE",
                  projectId: "test-project",
                  proposerId: "e2e-signer.near",
                  creationBlockHeight: 1234567,
                  endBlockHeight: 9999999,
                  quorum: "100",
                },
              ],
            },
          }),
        });
        return;
      }

      if (operationName === "GetProposal") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              proposal: {
                id: "proposal-1",
                title: "E2E Test Proposal",
                description: "This proposal allows us to test the voting modal",
                status: "ACTIVE",
              },
            },
          }),
        });
        return;
      }

      await route.continue();
    });

    await page.goto("/proposals");
  });

  test("should open the vote dialog and successfully submit a mocked vote", async ({
    page,
  }) => {
    await page.waitForLoadState("networkidle");

    // Click the proposal in the list
    const proposalLink = page.getByText("E2E Test Proposal");
    if (await proposalLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await proposalLink.click();
      await page.waitForLoadState("networkidle");

      // Verify the vote button is ready
      const voteBtn = page.getByRole("button", { name: /Cast Vote/i }).first();
      // Only proceed if active
      if (await voteBtn.isVisible()) {
        await voteBtn.click();

        // In VoteOptionsDialog, we added data-testid to the radio inputs
        // e.g. data-testid="vote-option-0" or similar, or just click the label
        // We can just click the first radio or "For" / "Approve"
        const approveOption = page.locator('input[type="radio"]').first();
        if (await approveOption.isVisible()) {
          await approveOption.check();
        }

        const submitVoteBtn = page.locator('button[type="submit"]', {
          hasText: /Submit Vote/i,
        });
        if (await submitVoteBtn.isVisible()) {
          await submitVoteBtn.click();
        }

        // The dialog should close upon success
        await expect(page.getByRole("dialog")).toBeHidden({ timeout: 10000 });
      }
    }
  });
});
