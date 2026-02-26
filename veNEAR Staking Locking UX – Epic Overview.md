## Purpose

This epic covers all improvements to veNEAR staking/locking UX, from urgent frontend fixes to longer-term smart contract architecture changes.

**Goal:** align the team on the nature of each issue and all pending discovery/questions/decisions.

## Quantifying Impact

**Current LST coverage:**

- Total NEAR supply: 1.28B  
- Total LST: 82M (6.5% of supply)  
- Current supported LSTs: 73.9M (90% of LSTs, 5.7% of total supply)  
  - stNEAR: 34.10M  
  - LiNEAR: 28.88M  
  - rNEAR: 10.93M  
- Remaining: 8.1M  
  - truNEAR 6.8M (institutional-focused via Trufin)  
  - Remainder: 1.3M (which LSTs are the largest in this set?)

**DISCOVERY NEEDED – Maxwell to help:**

- How many users own 2+ LSTs? (determines priority of multi-LST support)  
  - 1600 accounts with at least 1 unit of 2+ LSTs in them  
  - 600 accounts with at least 50 units 2+ LSTs in them  
    - 5600 accounts with at least 50 units 1+ LSTS in them  
    - \~11% of users have 2+ LSTs  
- Are Trufin’s institutional users likely to want to participate in HoS?  
  - My gut feeling says probably not, but I will reach out to them directly \-M  
  - Confirmed: NF is pulling out of partnership with TruNEAR, I expect that number will drop to near 0 soon  
- What % of staked NEAR is in LSTs vs staked directly to validators? (determines impact of Staking Lock feature)  
  - Native Staked NEAR total is approx 525M (fluctuates a little)  
  - LST NEAR total is approx 80M  
  - LSTs are approx 13% of total staked NEAR  
- Other LSTs: cooldown periods, on-chain cooldown communication, adoption metrics

## Issues Overview

Issues are organized by type: Frontend (urgent), Architecture (Q1), and UX Refinements.

### FRONTEND FIXES (Urgent)

**1\. Add unstake & delete lockup to UI**

- **Status:** DONE \- PR \#234 (see link below)  
- **Problem:** Users cannot withdraw funds via UI. Must use CLI.  
- **Solution:**  
  - Add UnstakeDialog with validation  
  - Track "Pending Release" with conditional Withdraw button (after \~52-65h unbonding)  
  - Add "Close Account" action (calls `delete_lockup`) \- only visible when contract empty  
- **Links:**  
  - Issue: [https://github.com/houseofstake/pm/issues/141](https://github.com/houseofstake/pm/issues/141)  
  - PR for unstake: [https://github.com/voteagora/agora-near/pull/234](https://github.com/voteagora/agora-near/pull/234)  
  - PR for delete: [https://github.com/voteagora/agora-near/pull/241](https://github.com/voteagora/agora-near/pull/241)  
  - CLI workaround: [https://github.com/voteagora/agora-near/wiki/How-to:-Unlock-NEAR-in-veNEAR-Alpha-Contracts](https://github.com/voteagora/agora-near/wiki/How-to:-Unlock-NEAR-in-veNEAR-Alpha-Contracts)

**2\. Fix onboarding disclosures**

- **Problem:** Copy implies user can unstake LSTs from third-party pool's frontend, but LST is owned by lockup contract \- this is impossible.  
- **Solution:** Update copy to accurately reflect contract behavior.  
  - **First Round:** update to reflect current behavior  
  - **Second Round:** update once contract changes are complete

**3\. Dust/rounding error on withdraw**

- **Problem:** Users report rounding errors (when they attempt unstake/unlock) leaving dust in contract, preventing delete and forcing another 45-day wait.  
- **DISCOVERY NEEDED:** Clarify exact mechanics with Cory. Is this an LST:NEAR price calculation issue? Can `unstake_all` / `withdraw_all` avoid this?  
- **ASSUMPTION TO TEST:** Using `unstake_all` instead of partial unstakes will prevent dust.

**4\. Support multiple LSTs in one lockup (UI)**

- **Problem:** UI only handles single LST. Users with multiple LSTs cannot unstake/withdraw properly.  
- **Current constraint:** LSTs must be unstaked sequentially (one at a time, each with its own cooldown) due to how liquid balance and pricing work in the contract.  
- **Solution (current contracts):**  
  - Implement Solution 1 from Agora doc (link below): iterate through curated LSTs, unstake each sequentially  
  - Communicate cooldown periods clearly  
  - User must return at the end of each cooldown period to process the next LST  
- **Solution (with new architecture, see \#6 below):** If LSTs can be withdrawn without unstaking, all can be withdrawn in parallel after single veNEAR unlock.  
- **Links:**  
  - Agora doc: [VeNEAR Unstaking / Withdraw Flow](https://www.notion.so/VeNEAR-Unstaking-Withdraw-Flow-2e0528b28fc480369adbf8d050698ba5?pvs=21)  
- **DECISION NEEDED:** Do we invest in enabling Solution 1 from Agora doc (link above) \- iterate through curated LSTs, unstake each sequentially \- or do we focus on harder challenge of enabling the LST to be withdrawn without forcing it to unstake? **(\#6 below)**

**5\. Improve clarity about LST cooldown periods**

- **Problem:** Users lack visibility into when their unstaking cooldown period ends.  
- **Current state:** The curated LSTs (stNEAR, liNEAR, rNEAR) have clearly communicated cooldown periods we can display. Legacy/unsupported LSTs do not — we would need to investigate each pool individually.  
- **Solution:**  
  - Display cooldown end timestamps for curated LSTs in the UI.  
  - Expand the curated set if we find other LSTs that meaningfully expand our LST coverage towards \~99% (pending discovery)  
  - For unsupported LSTs, we’ll add tooltips explaining why we’re unable to display the cooldown.

**\[TO ADD\] Allow users to switch selected staking pool**

### ARCHITECTURE CHANGES (Q1 \- requires audit)

**6\. Enable LST withdrawal without unstaking**

- **Problem:** Current contracts force users to unstake LSTs to withdraw. This causes:  
  - Sequential \~52h cooldowns per LST, requiring the user to come back at the end of each cooldown period  
  - Tax events on each unstake  
  - No "rage quit" possible, i.e. one-click exit  
- **Root cause:** Native NEAR and LST balances are commingled in the lockup contract. Price must be determined at unstake time.  
- **Solution:** Upgrade contracts to enable withdrawing LSTs without unstaking.  
- **Impact:**  
  - Single veNEAR unlock cooldown, then withdraw; no sequential LST unstaking cooldowns  
  - No tax event (user receives LST, not NEAR)  
  - Enables "rage quit" button  
- **DECISION NEEDED:** Does the LST Support Spec (\#7 below) make this unnecessary? If the new LST Lockup architecture allows direct LST withdrawal, this may be solved inherently.

**7\. Lock already-staked LSTs into HoS (LST Support Spec)**

- **Problem:** Existing LST holders who want to enter HoS must unstake, wait \~52h unbonding, then re-enter through lockup. This creates friction and tax events.  
- **Solution:** New LST Lockup Contract (separate from existing NEAR Lockup). Users deposit LSTs directly, veNEAR calculated from underlying NEAR value via exchange rate.  
- **Key design choices:**  
  - Maintains user custody (non-upgradeable per-user contracts)  
  - Exchange rates fetched live (not locked at deposit)  
  - Same unlock duration and penalty mechanics as NEAR  
  - Whitelist controlled by owner (initially multi-sig, eventually DAO)  
- **Complexity:** Medium \- LSTs are NEP-141 tokens and can be transferred  
- **Links:**  
  - Issue: [https://github.com/houseofstake/pm/issues/107](https://github.com/houseofstake/pm/issues/107)

**8\. Lock any staked NEAR without unstaking (Staking Lock Spec)**

- **Problem:** Users with NEAR staked directly to validators (not via LSTs) must unstake to participate in HoS. This is a tax event and excludes a significant portion of staked NEAR.  
- **Solution:** Staking Lock mechanism \- user delegates authority over their account to a Staking Lock contract that blocks unstake/withdraw actions while permitting all other operations. User's keys are rotated to enforce the lock.  
- **Key insight:** NEAR accounts are "tokenizable" \- whoever controls keys controls the account. Lock the keys, lock the stake, no asset movement \= no tax event.  
- **Complexity:** High \- requires key rotation, action filtering, novel trust model  
- **Links:**  
  - Issue: [https://github.com/houseofstake/pm/issues/105](https://github.com/houseofstake/pm/issues/105)  
- **DISCOVERY NEEDED:** What % of staked NEAR is direct-to-validator vs LST? This determines impact/priority.

**9\. Abstract contract migrations**

- **Problem:** veNEAR contracts are non-upgradeable. Existing users must fully exit (unstake all, delete lockup, withdraw funds) and re-enter to benefit from new contracts.  
- **Solution:** Streamline the steps needed to migrate contracts by building a migration flow in the frontend.

### UX Refinements

**10\. veNEAR copy, education, onboarding**

- **Problem:** We have seen many cases of users being confused about veNEAR’s mechanics.  
- **DISCOVERY NEEDED:** Pending our architectural changes that will make veNEAR inherently more intuitive, we need to do some discovery to identify ways that we can improve copy (e.g. consistent messaging), UI/UX, and user journeys to eliminate confusion.

**11\. Minimize onboarding/offboarding transactions**

- **Problem:** We have received feedback that it takes too many transactions to onboard/offboard into HoS.  
- **DISCOVERY NEEDED:** Our fundamental architectural changes will solve much of this, but we should investigate other ways that we can reduce/batch transactions into a one-click experience.

## Dependencies & Sequencing

```
FRONTEND (now)
├── #1 Unstake & delete lockup UI (PR #234) - URGENT
├── #2 Fix onboarding disclosures (two rounds)
├── #3 Investigate dust issue
├── #4 Multi-LST UI support (sequential unstaking)
└── #5 Improve clarity about LST cooldown periods

ARCHITECTURE (Q1, requires audit)
├── #6 Enable LST withdrawal without unstaking
│   ├── Enables: rage quit, parallel withdrawal, no tax on exit
│   └── MAY BE SUPERSEDED BY #7
│
├── #7 LST Support Spec (lock already-staked LSTs)
│   ├── Easier - LSTs are transferable tokens
│   └── DECISION: Does this also solve #6?
│
├── #8 Staking Lock Spec (lock any staked NEAR)
│   ├── Harder - requires key rotation mechanism
│   └── Independent workstream from #7
│
└── #9 Abstract contract migrations
    └── Streamline exit/re-onboard flow in frontend

UX REFINEMENTS
├── #10 veNEAR copy, education, onboarding
└── #11 Minimize onboarding/offboarding transactions
```

## Discovery Needed

| Question | Owner | Relevant to |
| :---- | :---- | :---- |
| How many users own 2+ LSTs? | Maxwell | \#4 Multi-LST support (DONE: \~11%) |
| Are Trufin's institutional users likely to want to participate in HoS? | Maxwell | LST coverage |
| What % of staked NEAR is LST vs direct-to-validator? | Maxwell | \#8 Staking Lock priority |
| Other LSTs: cooldown periods, on-chain communication, adoption | Maxwell | Curated set expansion |
| Exact mechanics of dust issue | Cory | \#3 Dust issue |
| Can `unstake_all` / `withdraw_all` prevent dust? | Cory | \#3 Dust issue |
| Ways to improve copy/UX to reduce confusion | TBD | \#10 Education |
| Other ways to reduce/batch transactions | TBD | \#11 Minimize txs |

## Open Questions

1. Does the LST Support Spec (\#7) architecture also enable withdrawing LSTs without unstaking, thus making \#6 unnecessary?  
2. Should we add an "Advanced" input field for power users with legacy/unsupported LSTs? (suggested in Agora doc as middle ground)  
3. For the Staking Lock (\#8): what if user loses their function call key? Need backup/recovery mechanism.  
4. What's the migration UX for existing users? How do we communicate "exit and re-onboard to get new features"? How can we abstract these steps?

## Decisions (all pending review)

| Decision | Status | Notes |
| :---- | :---- | :---- |
| Support a curated set of LSTs, not "any" LST | PENDING | Curated \= stNEAR, liNEAR, rNEAR. Only add more if they get us closer to 99% coverage of relevant LSTs. |
| Users who bypass UI to send unsupported LSTs are responsible for reversing via CLI | PENDING | "Buyer beware" \- assumes technical sophistication |
| UI will only call `unstake_all` (not partial unstakes) | PENDING | Avoids dust remaining in contract |
| Delete Lockup button appears only when contract is empty (0 staked, 0 pending, 0 liquid) | PENDING | Final step after full withdrawal sequence |
| "Rage quit" button requires contract rearchitecture | PENDING | Not achievable with current contracts |
| Avoiding tax events is an explicit product requirement | PENDING | Drives priority of architecture changes |

