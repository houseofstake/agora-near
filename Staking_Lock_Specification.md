

# **Technical Specification**

Staking Lock Mechanism

House of Stake Contracts

V1.0.0 \- 2025-12-04  
Status: Draft for Engineering Review

# **Executive Summary**

This specification proposes a new mechanism for House of Stake governance participation that allows users with existing staked NEAR positions to participate in governance **without ever unstaking**. Unlike the current custody-based lockup model, this approach uses NEAR's account model to create an authority-based lock where users temporarily restrict their own ability to access staked funds.

The key insight is that NEAR accounts are effectively "tokenizable" — whoever controls an account's keys controls the account. Rather than moving NEAR into a lockup contract, users delegate specific authority over their account to a Staking Lock contract that acts as a programmable filter, blocking only the actions that would allow access to staked funds (unstake, withdraw) while permitting all other account operations.

This solves a critical gap in House of Stake's current design: users with NEAR already staked to validator pools currently face a taxable event both when entering governance (must unstake to deposit into lockup) and when exiting (must unstake to withdraw from lockup). The Staking Lock eliminates both tax events, making governance participation truly orthogonal to staking.

1. # **Problem Statement**

   1. ## **Background: How NEAR Staking Works**

Unlike some chains where delegation is a protocol-level primitive, NEAR validators operate through **staking pool contracts**. When a user "stakes with a validator," they are actually depositing NEAR into that validator's pool contract:

* User calls deposit\_and\_stake() on the pool contract  
* Pool contract records user's balance in its internal state  
* Pool aggregates all delegator funds and stakes them with the validator  
* User's "stake" is an internal accounting entry, not a transferable token

This is fundamentally different from Liquid Staking Tokens (LSTs) where users receive a NEP-141 token representing their position. With direct staking, the user holds nothing transferable — their stake exists only as state inside the pool contract.

2. ## **The Entry Problem**

House of Stake's current lockup model requires users to deposit NEAR into a lockup contract to participate in governance. For a user with an existing staking position, this means:

1. Call unstake() on the staking pool — **potential taxable event**  
2. Wait \~52 hours for unbonding (4 epochs)  
3. Call withdraw() to retrieve NEAR  
4. Deposit NEAR into HoS lockup contract  
5. Lock NEAR in lockup  
6. Optionally re-stake from lockup (if they want to continue earning)

The unstaking in step 1 may trigger capital gains recognition in many jurisdictions. Even if the user immediately re-stakes, they have realized gains/losses on their position.

3. ## **The Exit Problem**

The same problem exists in reverse. When a user wants to leave governance and recover their NEAR:

1. Complete the governance unlock process (begin\_unlock, wait 45 days, end\_unlock)  
2. Call unstake() if NEAR was staked from lockup — **potential taxable event**  
3. Wait \~52 hours for unbonding  
4. Withdraw from staking pool  
5. Transfer NEAR out of lockup

   4. ## **The Principle: Orthogonality**

From a user's perspective, staking and governance should be **completely orthogonal** decisions:

* Joining governance should not affect staking position  
* Leaving governance should not affect staking position  
* Starting or stopping staking should not affect governance participation  
* Choice of validator/pool should not constrain governance options

The current custody-based model fundamentally violates this principle. We need a different approach.

2. # **Key Insight: Accounts Are Tokenizable**

   1. ## **NEAR's Account Model**

NEAR accounts have a unique property: all actions on an account are authorized via  
**access keys**. An account can have multiple keys with different permission levels:

* **Full Access Keys:** Can perform any action on the account  
* **Function Call Keys:** Can only call specific methods on specific contracts

Critically, **whoever controls an account's keys controls the account**. If alice.near removes all her full access keys and the only way to add them back is through a time-locked contract, then effectively:

* The entire account is "locked"  
* Everything inside it (balances, stake positions, NFTs) is locked by extension  
* Nothing moves, nothing changes hands — no taxable event  
* The account itself has become the locked asset

  2. ## **Custody vs. Authority**

This reframes the lockup model entirely:

| Custody-Based (Current) | Authority-Based (Proposed) |
| :---- | :---- |
| "I deposit my NEAR into a contract that holds it" | "I restrict my own keys so I can't access my staked funds" |
| NEAR moves to lockup contract | NEAR stays exactly where it is |
| Requires unstaking to enter/exit | No unstaking ever required |
| Lockup contract holds the asset | Staking Lock holds the keys |

3. ## **Selective Restriction**

Full account lockup would be too restrictive — the user couldn't claim airdrops, vote in other protocols, or perform routine account maintenance. Instead, we want **surgical restriction**: the user gives up only the ability to access staked funds.

NEAR's function call keys are allowlists, not blocklists — you specify what IS permitted, not what ISN'T. So we can't directly say "allow everything except unstake." Instead, we route transactions through a proxy that acts as a programmable filter:

* User removes their full access key  
* User adds a function call key that can only call the Staking Lock contract  
* User performs all actions via Staking Lock's execute() method  
* Staking Lock checks each action: if it's a restricted action (unstake, withdraw), reject; otherwise, execute on user's behalf

3. # **Proposed Solution: Staking Lock**

   1. ## **Architecture Overview**

The Staking Lock is a new contract that serves two purposes:

1. **Action Filter:** Proxies user transactions, blocking only restricted actions  
2. **Balance Reporter:** Reports verified staked balances to veNEAR for voting power

Importantly, the Staking Lock is *not* part of veNEAR. Separation of concerns dictates that veNEAR should focus on governance tracking, not transaction filtering. The Staking Lock is a purpose-built contract that reports to veNEAR, similar to how the existing lockup contracts report to veNEAR.

| │ | (alice.near) |  |  | │ |
| :---- | :---- | :---- | :---- | ----: |
| │ |  |  |  | │ |
| │ | Keys: |  |  | │ |
| │	\- Function Call Key → staking-lock.near:execute()	│ |  |  |  |  |
| │ | \- (Full Access Key removed during lock period) |  |  | │ |
| │ |  |  |  | │ |
| │ | Assets: 10,000 NEAR staked in aurora.pool.near |  |  | │ |
| │ | (unchanged \- never moved\!) |  |  | │ |

2. ## **User Flow: Joining Governance**

Alice has 10,000 NEAR staked in aurora.pool.near and wants to participate in House of Stake governance:

1. **Register with veNEAR:** Alice calls veNEAR to create her governance account (same as today)  
2. **Register with Staking Lock:** Alice calls staking-lock.register(), specifying which staking pools hold her locked stake  
3. **Staking Lock verifies balances:** Cross-contract calls to aurora.pool.near to verify Alice's staked balance  
4. **Key rotation:** Alice adds a function call key for staking-lock.near and removes her full access key (atomic transaction)  
5. **Staking Lock reports to veNEAR:** Calls on\_staking\_lock\_update() with verified balance  
6. **Done:** Alice has veNEAR voting power. Her NEAR never moved. No unstaking occurred.

   3. ## **User Flow: Normal Operations**

While locked, Alice can still perform most actions on her account by routing them through the Staking Lock:

* **Allowed:** Transfer liquid NEAR, interact with DeFi protocols, claim airdrops, vote in other DAOs, manage NFTs, deploy contracts, etc.  
* **Blocked:** unstake(), withdraw\_all(), withdraw() on registered staking pools

Alice calls staking-lock.execute(action) for each transaction. The Staking Lock checks: is this action calling unstake/withdraw on a registered pool? If yes, reject. If no, execute via cross-contract call to Alice's account.

4. ## **User Flow: Exiting Governance**

Alice decides to leave House of Stake:

1. **Begin unlock:** Alice calls staking-lock.begin\_unlock()  
2. **Staking Lock notifies veNEAR:** Balance moves to pending state, extra\_venear forfeited (same as current model)  
3. **Wait:** Unlock duration passes  
4. **End unlock:** Alice calls staking-lock.end\_unlock()  
5. **Key restoration:** Staking Lock restores Alice's full access key  
6. **Staking Lock notifies veNEAR:** Alice's governance balance goes to zero  
7. **Done:** Alice has exited governance. Her NEAR is still staked in aurora.pool.near. No unstaking occurred.

4. # **Technical Design**

   1. ## **Staking Lock Contract State**

2. **Key Staking Lock Methods**

   1. **register()**

Registers a user for the staking lock mechanism. This must be called before the key rotation.

Initiates cross-contract calls to verify balances in each pool. On success, creates the UserLockState and reports to veNEAR.

2. **execute()**

The core action proxy. Users call this for all operations while locked.

Logic: If receiver\_id is a locked pool AND method\_name is in \["unstake", "unstake\_all", "withdraw", "withdraw\_all"\], reject. Otherwise, execute the call on behalf of the user's account.

3. **begin\_unlock() and end\_unlock()**

Standard unlock flow, mirroring the existing lockup contract pattern:

3. ## **veNEAR Contract Changes**

veNEAR needs minimal changes to accept reports from the Staking Lock, similar to how it accepts reports from lockup contracts:

* **New state:** staking\_lock\_contract\_id: Option\<AccountId\>  
* **New AccountInternal fields:** staking\_lock\_nonce: u64, staking\_lock\_balance: Balance  
* **New method:** on\_staking\_lock\_update(owner\_account\_id, nonce, locked\_balance, pending\_balance)

The veNEAR balance calculation combines all sources: NEAR lockup balance \+ LST lockup balance (if implemented) \+ Staking Lock balance.

4. ## **Key Rotation Mechanics**

The critical security mechanism is the key rotation. This must be done atomically in a single transaction:

After this transaction, the user can ONLY interact with their account through the Staking Lock contract. The Staking Lock stores the original public key and restores it upon successful unlock completion.

5. # **Security Analysis**

   1. ## **Trust Model**

Users trust the Staking Lock contract to:

* Correctly filter restricted actions (not block legitimate operations)  
* Restore their full access key upon successful unlock  
* Not have any backdoor that could be exploited  
* Accurately report balances to veNEAR

This is a meaningful trust assumption. However, it's comparable to trusting the existing lockup contract, which also has custody of user funds. The Staking Lock actually has *less* power — it cannot move user funds, only filter actions.

2. ## **Attack Vectors**

**Malicious Staking Lock upgrade:** If the Staking Lock contract is upgradeable, a malicious upgrade could add a backdoor. Mitigation: Deploy as non-upgradeable, or use a DAO-controlled upgrade mechanism with timelock.

**Key restoration failure:** If end\_unlock() fails to restore the user's key, they could be permanently locked out. Mitigation: Store the original public key, not the private key. The contract can always add the key back. Include emergency recovery mechanisms.

**Balance manipulation:** User could try to unstake through an unregistered pool or move funds. Mitigation: Only registered pools count toward veNEAR balance.  
Moving funds elsewhere doesn't help — the stake must remain in registered pools to have voting power.

**Cross-contract call failures:** If execute() calls fail, user operations could be blocked. Mitigation: Standard NEAR error handling. Failed calls don't lock user funds  
— they can retry or use a different approach.

**Staking pool contract changes:** A staking pool could add new withdrawal methods. Mitigation: Whitelist both pools AND methods. New methods require Staking Lock updates. Use conservative filtering (block unknown methods on registered pools).

3. **Comparison to Custody Model**

| Risk | Custody Model | Authority Model |
| :---- | :---- | :---- |
| Contract bug could lose funds | Yes (funds in contract) | No (funds stay in pool) |
| Contract bug could block access | Yes | Yes |
| Requires unstaking | Yes (entry and exit) | No |
| Tax implications | High (taxable events) | None |
| Complexity | Lower | Higher |

6. # **Open Questions**

### **Q1: Should the Staking Lock be upgradeable?**

Non-upgradeable is more secure but prevents bug fixes. Options: (a)  
non-upgradeable with version migration path, (b) DAO-controlled upgrades with timelock, (c) upgradeable by admin with social trust. Recommendation: Option (b) with substantial timelock (7+ days).

### **Q2: What if a staking pool adds new withdrawal methods?**

Options: (a) whitelist specific methods (requires updates), (b) blacklist restricted methods (may miss new ones), (c) only allow whitelisted methods on registered pools (most restrictive but safest). Recommendation: Option (c) with governance process to whitelist new safe methods.

### **Q3: How to handle multiple staking pools per user?**

The current design supports multiple pools per user. Balance verification and reporting aggregates across all registered pools. This adds complexity but reflects real user behavior.

### **Q4: Should there be a minimum lock amount?**

Small locks have proportionally higher overhead (cross-contract calls, storage). Recommendation: Set a minimum (e.g., 100 NEAR) consistent with other HoS minimums.

### **Q5: How to handle balance changes while locked?**

Staking rewards cause balances to grow. Options: (a) periodic refresh calls required by user, (b) automatic refresh on any staking-lock interaction, (c) timestamp-based decay if not refreshed. Recommendation: Option (b) with optional manual refresh\_balance() method.

### **Q6: What if the user loses the function call key?**

They cannot interact with their account until unlock completes. Emergency options:  
(a) social recovery via trusted parties, (b) governance override for clear lockout cases, (c) backup key mechanism. Recommendation: Consider backup key stored with Staking Lock, usable only for begin\_unlock/end\_unlock.

### **Q7: Should this coexist with or replace the custody model?**

Recommendation: Coexist. Different users have different preferences. Some may prefer the simplicity of custody; others need the tax efficiency of authority-based locking. veNEAR can accept reports from both mechanisms and aggregate voting power.

7. # **Implementation Roadmap**

   1. ## **Phase 1: Core Contract**

1. Implement Staking Lock contract with register(), execute(), begin\_unlock(), end\_unlock()  
2. Implement action filtering logic  
3. Implement balance verification via cross-contract calls

4. Unit tests for all methods

   2. ## **Phase 2: veNEAR Integration**

1. Add on\_staking\_lock\_update() to veNEAR  
2. Extend AccountInternal with staking lock fields  
3. Update balance aggregation in Merkle tree generation  
4. Integration tests for full registration and unlock flows

   3. ## **Phase 3: Testnet**

* Deploy to testnet with real staking pool interactions  
* User testing with various wallet configurations  
* Security review and audit

  4. ## **Phase 4: Mainnet**

* Deploy Staking Lock contract  
* Upgrade veNEAR with staking lock support  
* Configure whitelisted pools  
* Documentation and user guides

8. # **Summary**

The Staking Lock mechanism provides a fundamentally different approach to governance participation that achieves true orthogonality between staking and governance:

* **No unstaking required — ever:** Users join and leave governance without touching their staking position  
* **Tax efficient:** No taxable events from governance participation  
* **Continuous rewards:** Users never stop earning staking rewards  
* **Validator choice preserved:** Users can lock stake with any whitelisted pool  
* **Coexists with custody model:** Users choose the approach that fits their needs

The mechanism leverages NEAR's unique account model where accounts are effectively "tokenizable" through key management. By delegating authority rather than custody, we achieve governance participation without the friction and tax consequences of the custody-based approach.

This represents a meaningful expansion of House of Stake's accessibility, potentially unlocking participation from users who have been deterred by the current model's tax implications.