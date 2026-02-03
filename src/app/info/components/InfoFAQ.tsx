"use client";

import { QuorumExplanation } from "@/components/Proposals/Proposal/QuorumExplanation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { trackEvent } from "@/lib/analytics";
import { MixpanelEvents } from "@/lib/analytics/mixpanel";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ReactNode, useCallback, useEffect, useState } from "react";

interface FAQ {
  id: string;
  question: string;
  answer: string | ReactNode;
}

// Reusable components for consistent styling

const Text = ({ children }: { children: ReactNode }) => (
  <p className="leading-relaxed">{children}</p>
);

const ExternalLink = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-primary underline hover:text-secondary font-medium"
  >
    {children}
  </a>
);

const Code = ({ children }: { children: string }) => (
  <code className="bg-gray-100 px-2 py-1 rounded">{children}</code>
);

const CodeLink = ({ href, code }: { href: string; code: string }) => (
  <ExternalLink href={href}>
    <Code>{code}</Code>
  </ExternalLink>
);

const Callout = ({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "info";
}) => (
  <div
    className={`border-l-4 border-primary p-6 rounded-r-lg ${variant === "info" ? "bg-blue-50" : "bg-gray-50 border border-gray-200"}`}
  >
    {children}
  </div>
);

const StepCard = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <p className="font-semibold mb-2 text-base">{title}</p>
    <Text>{children}</Text>
  </div>
);

interface APITableRow {
  contract: string;
  method: string;
  methodUrl: string;
  description: ReactNode;
}

const APITable = ({ rows }: { rows: APITableRow[] }) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200">
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="bg-gray-100">
          <th className="border-b border-gray-300 px-6 py-4 text-left font-semibold">
            Contract
          </th>
          <th className="border-b border-gray-300 px-6 py-4 text-left font-semibold">
            API Method
          </th>
          <th className="border-b border-gray-300 px-6 py-4 text-left font-semibold">
            Description
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx} className="hover:bg-gray-50">
            <td className="border-b border-gray-200 px-6 py-4">
              {row.contract}
            </td>
            <td className="border-b border-gray-200 px-6 py-4">
              <CodeLink href={row.methodUrl} code={row.method} />
            </td>
            <td className="border-b border-gray-200 px-6 py-4 leading-relaxed">
              {row.description}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const generalFaqs: FAQ[] = [
  {
    id: "what-is-near-governance",
    question: "What is NEAR House of Stake governance?",
    answer: (
      <Text>
        NEAR House of Stake governance is a decentralized governance system that
        empowers token holders to lock NEAR for voting rights, delegate votes to
        trusted representatives, and earn rewards for active participation. It
        enables the community to collectively make decisions about the
        protocol&apos;s future.
      </Text>
    ),
  },
  {
    id: "contract-level-onboarding",
    question:
      "How does onboarding to NEAR House of Stake work at the contract level?",
    answer: (
      <div className="space-y-6">
        <Text>
          Onboarding to House of Stake involves a few different contract
          operations and transfers:
        </Text>
        <div className="space-y-4">
          <StepCard title="1. Make a deposit to the veNEAR contract">
            The user sends a small amount of NEAR to the veNEAR contract to
            cover storage costs and enable participation.
          </StepCard>
          <StepCard title="2. Deploy a personal lockup contract">
            The user requests the veNEAR contract to create their own lockup
            contract and pays the storage and deployment fees.
          </StepCard>
          <StepCard title="3. Fund your lockup contract">
            The user transfers NEAR, or any other supported tokens, from their
            wallet into their personal lockup contract.
          </StepCard>
          <StepCard title="4. Choose a staking service">
            The user selects which staking pool (like Meta Pool or liNEAR) to
            stake with.
          </StepCard>
          <StepCard title="5. Lock your NEAR tokens">
            The user locks the tokens inside the lockup contract to receive
            voting power.
          </StepCard>
          <StepCard title="6. (Optional) Stake your tokens">
            The user may choose to stake their locked tokens to earn staking
            rewards while participating in governance.
          </StepCard>
        </div>
        <div className="mt-8 border border-gray-200 rounded-lg overflow-hidden">
          <Image
            src="/images/house_of_stake_onboarding.png"
            alt=""
            className="w-full h-auto"
            width={0}
            height={0}
            unoptimized
          />
        </div>
      </div>
    ),
  },
  {
    id: "staking-pools-whitelist",
    question:
      "Why are liNEAR and Meta Pool the only supported staking pools for House of Stake?",
    answer: (
      <div className="space-y-6">
        <Text>
          The goal of House of Stake is to make onboarding as seamless as
          possible. Liquid staking tokens, such as liNEAR and stNEAR, allow
          users to instantly transfer and lock tokens for voting power, without
          any disruption to your staking rewards.
        </Text>
        <Text>
          With that being said, House of Stake contracts support any staking
          pool that&apos;s whitelisted. Refer to the table below for the key
          contract APIs you&apos;ll need to interact with.
        </Text>
        <APITable
          rows={[
            {
              contract: "veNEAR contract",
              method: "get_config",
              methodUrl:
                "https://github.com/fastnear/house-of-stake-contracts/blob/main/venear-contract/src/config.rs#L46",
              description: (
                <>
                  Returns the veNEAR config, including the{" "}
                  <CodeLink
                    href="https://github.com/fastnear/house-of-stake-contracts/blob/main/venear-contract/src/config.rs#L22"
                    code="staking_pool_whitelist_account_id"
                  />
                  .
                </>
              ),
            },
            {
              contract: "Lockup contract",
              method: "select_staking_pool",
              methodUrl:
                "https://github.com/fastnear/house-of-stake-contracts/blob/main/lockup-contract/src/owner.rs#L15",
              description:
                "Allows you to set your preferred staking pool. Note that if you've already selected a staking pool such as liNEAR or stNEAR you'll need to unset your existing staking pool.",
            },
            {
              contract: "Lockup contract",
              method: "unselect_staking_pool",
              methodUrl:
                "https://github.com/fastnear/house-of-stake-contracts/blob/main/lockup-contract/src/owner.rs#L47",
              description:
                "Allows you to unset your current staking pool. Note you can only unset your staking pool if the amount deposited in that pool is 0. Otherwise you will need to withdraw first.",
            },
          ]}
        />
        <Callout variant="info">
          <p className="leading-relaxed italic">
            If you have a preferred staking pool that is not currently
            whitelisted, create a proposal and suggest which staking pools
            should be added.
          </p>
        </Callout>
      </div>
    ),
  },
  {
    id: "manage-staking-directly",
    question:
      "Why can't I manage my staking directly within the House of Stake dapp?",
    answer: (
      <div className="space-y-6">
        <Text>
          House of Stake&apos;s primary focus is to give NEAR token holders a
          way to gain voting power, earn rewards, and boost rewards with
          staking. When you stake your locked NEAR tokens, you are doing so
          through your lockup contract, which is custodying your funds.
        </Text>
        <Text>
          If you&apos;d like to further manage staked funds, you can use the
          lockup API methods to do so. The table below highlights the key API
          methods for managing your staked funds:
        </Text>
        <APITable
          rows={[
            {
              contract: "Lockup contract",
              method: "deposit_and_stake",
              methodUrl:
                "https://github.com/fastnear/house-of-stake-contracts/blob/main/lockup-contract/src/owner.rs#L127C12-L127C29",
              description:
                "Deposits funds that are in your lockup contract into the staking pool and stakes them.",
            },
            {
              contract: "Lockup contract",
              method: "unstake",
              methodUrl:
                "https://github.com/fastnear/house-of-stake-contracts/blob/main/lockup-contract/src/owner.rs#L333",
              description: "Unstakes your funds from the staking pool.",
            },
            {
              contract: "Lockup contract",
              method: "withdraw_from_staking_pool",
              methodUrl:
                "https://github.com/fastnear/house-of-stake-contracts/blob/main/lockup-contract/src/owner.rs#L213",
              description:
                "Withdraws all available funds from the staking pool.",
            },
            {
              contract: "Lockup contract",
              method: "refresh_staking_pool_balance",
              methodUrl:
                "https://github.com/fastnear/house-of-stake-contracts/blob/main/lockup-contract/src/owner.rs#L175C12-L175C40",
              description:
                "Retrieves total liquid balance from the staking pool and updates the internal state of the lockup contract. This is useful if you have staking rewards that you want to withdraw (you can withdraw the staking rewards without unlocking your principal balance of NEAR!).",
            },
          ]}
        />
      </div>
    ),
  },
  {
    id: "fungible-token-withdrawal",
    question: "Why do I need to unstake my liNEAR and stNEAR to withdraw?",
    answer: (
      <Text>
        In the current House of Stake contracts, users can deposit liNEAR or
        stNEAR into the lockup contract, but the design does not support direct
        transfers of these tokens out of the contract. Instead, users must
        unstake the tokens back to native NEAR before withdrawal as a
        workaround. This stems from an initial focus on staking functionality
        rather than full transferability, with fungible token transfers
        complicated by pricing dependencies not denominated in NEAR. The lockup
        contract is non-upgradable, making this behavior fixed for the lifetime
        of the V1 lockup contract. This will be addressed in a future version of
        House of Stake.
        <br />
        <br />
        See the wiki{" "}
        <ExternalLink href="https://github.com/voteagora/agora-near/wiki/How-To:-Withdrawing-NEAR-after-transferring-LST-to-Lockup-Contract">
          here
        </ExternalLink>{" "}
        for more information.
      </Text>
    ),
  },
  {
    id: "how-to-participate",
    question: "How can I participate in NEAR governance?",
    answer: (
      <Text>
        You can participate by locking your NEAR tokens to gain voting power,
        delegating your voting power to trusted delegates who align with your
        values, or becoming a delegate yourself. All participants earn rewards
        for their active involvement in the governance process.
      </Text>
    ),
  },
  {
    id: "what-are-delegates",
    question: "What are delegates and why are they important?",
    answer: (
      <Text>
        Delegates are community members who have been entrusted with voting
        power by token holders. They actively participate in governance by
        voting on proposals, engaging in discussions, and representing the
        interests of those who delegated to them. Delegates play a crucial role
        in ensuring informed decision-making.
      </Text>
    ),
  },
  {
    id: "voting-power",
    question: "How is voting power calculated?",
    answer: (
      <Text>
        Voting power is determined by the amount of NEAR tokens you have locked
        in the governance contract. The more NEAR you lock, the more voting
        power you have. You can either use this voting power directly or
        delegate it to others while still maintaining ownership of your tokens.
      </Text>
    ),
  },
  {
    id: "quorum-requirements",
    question: "What are the quorum requirements?",
    answer: (
      <Text>
        <QuorumExplanation />
        {` In House of Stake v1.5, the quorum requirement will be enforced onchain.`}
      </Text>
    ),
  },
  {
    id: "locking-period",
    question: "What is the token locking period?",
    answer: (
      <Text>
        When you lock NEAR tokens for governance, they are locked for a specific
        period. During this time, you cannot transfer or use these tokens for
        other purposes, but you maintain voting rights and earn rewards. The
        locking period helps ensure long-term alignment with the protocol&apos;s
        success.
      </Text>
    ),
  },
  {
    id: "delegation-vs-direct-voting",
    question: "Should I delegate or vote directly?",
    answer: (
      <Text>
        The choice depends on your level of engagement and expertise. If you
        have the time and knowledge to research proposals thoroughly, direct
        voting gives you full control. If you prefer to entrust your voting
        power to someone who actively participates in governance, delegation is
        a great option.
      </Text>
    ),
  },
  {
    id: "staking-unstaking-cli",
    question:
      "How to interact with the underlying staking pool through the lockup contracts?",
    answer: (
      <Text>
        We put together a guide on how to interact with the underlying staking
        pool through the lockup contracts:{" "}
        <Link
          className="text-primary underline hover:text-secondary font-medium"
          href="https://github.com/voteagora/agora-near/wiki/How-to:-Lock-and-Stake-with-a-Custom-Staking-Pool"
        >
          Lock and Stake with a Custom Staking Pool
        </Link>
      </Text>
    ),
  },
  {
    id: "non-liquid-staking-pools",
    question:
      "What are Non-Liquid Staking Pools and how do I bring them into House of Stake?",
    answer: (
      <div className="space-y-6">
        <Text>
          Non-Liquid Staking Pools are traditional NEAR staking pools that
          don&apos;t provide liquid staking tokens (like liNEAR or stNEAR). If
          you have NEAR staked with one of these pools, you can still
          participate in House of Stake governance by bringing those staked
          tokens into the system.
        </Text>
        <Text>
          House of Stake now supports whitelisted Non-Liquid Staking Pools,
          allowing you to stake directly with any pool on the whitelist rather
          than only the liquid staking providers. This is useful if you:
        </Text>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>Already have tokens staked with a specific validator</li>
          <li>Prefer a particular staking pool for your own reasons</li>
          <li>
            Want to support a specific validator while participating in
            governance
          </li>
        </ul>

        <div className="mt-4">
          <p className="font-semibold mb-3 text-base">
            How the Staking Pool Whitelist Works
          </p>
          <Text>
            House of Stake uses a whitelist contract to control which staking
            pools can be used with lockup contracts. This security measure
            ensures that only trusted, verified staking pools can receive
            delegated funds. When you select a staking pool, the lockup contract
            verifies the pool is whitelisted before allowing the selection.
          </Text>
          <div className="mt-4 space-y-3">
            <Text>
              The whitelist contract address is configured in the veNEAR
              contract and can be viewed via the{" "}
              <Code>staking_pool_whitelist_account_id</Code> field in the{" "}
              <Code>get_config</Code> response. The whitelist is governed by
              House of Stake, and new pools can be added through the governance
              proposal process.
            </Text>
            <Text>
              When you enter a pool account ID in the UI, the system
              automatically checks the whitelist to verify the pool is allowed.
              If a pool is not whitelisted, you will see an error message and
              won&apos;t be able to select it.
            </Text>
          </div>
        </div>

        <div className="mt-4">
          <p className="font-semibold mb-3 text-base">
            How to Stake with Non-Liquid Pools
          </p>
          <Text>
            Use the{" "}
            <Link
              className="text-primary underline hover:text-secondary font-medium"
              href="/assets/non-liquid-staking"
            >
              Non-Liquid Staking Pools page
            </Link>{" "}
            to manage your positions.
          </Text>

          <div className="mt-4 mb-6">
            <p className="font-medium mb-2 text-sm text-gray-700 uppercase tracking-wide">
              Option A: Migrating from an External Wallet
            </p>
            <Text>
              If your tokens are currently staked in your personal wallet (e.g.,
              MyNearWallet, Meteor), you cannot transfer the stake directly. You
              must:
            </Text>
            <ul className="list-decimal list-inside space-y-2 mt-2 pl-2">
              <li>Unstake your tokens using your current wallet interface.</li>
              <li>Wait for the release period (typically 2-3 days).</li>
              <li>Withdraw the tokens to your wallet balance.</li>
              <li>Deposit the liquid NEAR into your House of Stake lockup.</li>
              <li>Select your desired Non-Liquid Staking Pool and stake.</li>
            </ul>
          </div>

          <p className="font-medium mb-2 text-sm text-gray-700 uppercase tracking-wide">
            Option B: Switching Pools within House of Stake
          </p>
          <Text>
            If you already have funds in your House of Stake lockup and want to
            switch pools:
          </Text>
        </div>
        <div className="space-y-4 mt-4">
          <StepCard title="1. Unstake from your current pool">
            Use the Staking dialog&apos;s Advanced section to unstake all tokens
            from your current pool.
          </StepCard>
          <StepCard title="2. Wait for cooldown">
            After unstaking, wait for the pool&apos;s cooldown period (typically
            2-3 epochs) before you can withdraw.
          </StepCard>
          <StepCard title="3. Withdraw to your lockup">
            Once cooldown is complete, use Advanced → Withdraw all to bring
            tokens back to your lockup contract.
          </StepCard>
          <StepCard title="4. Refresh your balance">
            Click Refresh balance to sync your lockup and surface any available
            rewards or withdrawal balance.
          </StepCard>
          <StepCard title="5. Unselect the old pool">
            When your deposited amount in the pool is 0, use Advanced → Unselect
            staking pool to clear your pool selection.
          </StepCard>
          <StepCard title="6. Select your preferred pool">
            Use the Staking dialog to select a new pool. You can choose any
            whitelisted pool, including Non-Liquid Staking Pools.
          </StepCard>
        </div>
        <Callout variant="info">
          <p className="leading-relaxed italic">
            If you have a preferred staking pool that is not currently
            whitelisted, you can create a governance proposal to request its
            addition to the whitelist.
          </p>
        </Callout>
      </div>
    ),
  },
  {
    id: "only-one-lst-position",
    question: "Why can't I lock more than one LST position?",
    answer: (
      <Text>
        The current contract architecture only allows one LST position to be
        locked at a time. Concurrent locking of multiple LSTs is not supported
        in House of Stake V1. When you lock NEAR tokens for governance, they are
        locked for a specific period. During this time, you cannot transfer or
        use these tokens for other purposes, but you maintain voting rights and
        earn rewards. The locking period helps ensure long-term alignment with
        the protocol&apos;s success.
      </Text>
    ),
  },
  {
    id: "proposal-alpha-unstake",
    question: "How do I unstake from the alpha contracts?",
    answer: (
      <Text>
        You can use a{" "}
        <ExternalLink href="https://github.com/voteagora/agora-near/wiki/How-to:-Unlock-NEAR-in-veNEAR-Alpha-Contracts">
          CLI
        </ExternalLink>
        , or there is a{" "}
        <ExternalLink href="https://unlock.houseofstake.dev/">
          Web UI
        </ExternalLink>
        .
      </Text>
    ),
  },
];

const rewardsFaqs: FAQ[] = [
  {
    id: "what-are-venear-rewards",
    question: "What are veNEAR rewards?",
    answer: (
      <Text>
        Locking your NEAR demonstrates long-term commitment to the NEAR
        ecosystem. When you lock NEAR, you receive veNEAR in return. For a
        limited time, House of Stake is offering additional rewards for every
        NEAR you lock.
      </Text>
    ),
  },
  {
    id: "how-to-receive-venear-rewards",
    question: "How can I receive veNEAR Rewards?",
    answer: (
      <Text>
        To receive veNEAR rewards, you need to lock NEAR.{" "}
        <Link
          href="/assets"
          className="text-primary underline hover:text-secondary font-medium"
        >
          Start here
        </Link>{" "}
        by clicking “Lock & Stake” and follow the guided process. This{" "}
        <ExternalLink href="https://www.youtube.com/watch?v=UMDX3uFvS3w">
          tutorial video
        </ExternalLink>{" "}
        walks you through each step. First, lock your NEAR to mint veNEAR.
        Second, optionally, stake your NEAR to receive additional governance
        rewards. Staking is not required to receive veNEAR rewards. That&apos;s
        it!
      </Text>
    ),
  },
  {
    id: "how-to-claim-venear-rewards",
    question: "How can I claim my veNEAR Rewards?",
    answer: (
      <Text>
        Go to the{" "}
        <Link
          className="text-primary underline hover:text-secondary font-medium"
          href="/assets"
        >
          House of Stake assets page
        </Link>
        , and connect your wallet. When rewards are available, a “Claim” button
        will appear. Click it to initiate the transfer of your rewards. You’ll
        receive NEAR directly into your lockup address, and your wallet balance
        will update accordingly. Rewards will be released in multiple rounds
        over a three-month period. By keeping your veNEAR locked, you’ll
        automatically participate in all upcoming rounds until the veNEAR
        rewards campaign concludes.
      </Text>
    ),
  },
  {
    id: "how-to-increase-governance-rewards",
    question: "How can I increase my governance rewards?",
    answer: (
      <div className="space-y-4">
        <Text>
          Your rewards increase based on how much NEAR you lock and how long you
          lock it for. Please note: The total amount of veNEAR rewards
          distributed depends on the overall NEAR participation in the rewards
          campaign.
        </Text>
        <Text>
          Your individual allocation scales with your lock amount and lock
          duration.
        </Text>
        <Text>
          You can also increase your overall participation rewards by staking
          NEAR (optional). Combining locking and staking may increase your
          overall participation rewards, depending on program parameters. For
          more details on how rewards are calculated,{" "}
          <ExternalLink href="https://github.com/houseofstake/proposals/blob/e82f6a2978d62617f9b79a8b39016e383d3189ee/HSPs/hsp-003.md">
            check out this link
          </ExternalLink>
          .
        </Text>
      </div>
    ),
  },
  {
    id: "unlock-venear-immediately",
    question: "Can I unlock my veNEAR immediately after claiming rewards?",
    answer: (
      <Text>
        Yes. Claiming rewards is independent of locking mechanics. You can
        unlock your veNEAR at any time. However, we encourage you to keep your
        veNEAR locked and delegate it to participate in governance and
        decision-making at House of Stake. Staying locked and delegated
        strengthens the ecosystem and gives you an active voice in shaping
        NEAR&apos;s future.
      </Text>
    ),
  },
  {
    id: "unlock-before-claiming",
    question:
      "If I unlock my veNEAR before claiming my rewards, will I lose them?",
    answer: (
      <Text>
        No. Rewards that have already been assigned to you remain claimable even
        after you unlock your veNEAR.
      </Text>
    ),
  },
  {
    id: "withdraw-immediately-after-unlock",
    question: "Can I withdraw my NEAR immediately after unlocking veNEAR?",
    answer: (
      <Text>
        No. Once you unlock veNEAR, there is a 45-day cooldown period. After the
        cooldown ends, you can withdraw your underlying NEAR.
      </Text>
    ),
  },
  {
    id: "min-amount-near",
    question:
      "What is the minimum amount of NEAR required to receive veNEAR rewards?",
    answer: (
      <Text>
        You must have at least 2.1 NEAR available in your wallet to qualify for
        veNEAR rewards.
      </Text>
    ),
  },
  {
    id: "delegate-venear-consequences",
    question: "What happens when I delegate veNEAR to a delegator?",
    answer: (
      <Text>
        Your veNEAR is burned, and new veNEAR is minted for the delegate. Your
        locked NEAR balance remains unchanged within the lockup contract. Your
        reward calculation is unaffected; delegating does not change the amount
        of rewards you receive. You can undelegate your veNEAR at any time.
      </Text>
    ),
  },
];

const walletFaqs: FAQ[] = [
  {
    id: "supported-wallets",
    question: "What wallets are supported?",
    answer: (
      <div className="space-y-6">
        <Text>
          House of Stake supports the most common NEAR wallets, including:
        </Text>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>MyNearWallet</li>
          <li>HERE Wallet</li>
          <li>Meteor Wallet</li>
          <li>Sender Wallet</li>
          <li>Nightly Wallet</li>
          <li>Ledger (via supported wallet integrations)</li>
          <li>Fireblocks vaults (see special instructions below)</li>
        </ul>
        <Text>
          To get started, go to{" "}
          <Link
            className="text-primary underline hover:text-secondary font-medium"
            href="/proposals"
          >
            gov.houseofstake.org/proposals
          </Link>
          , connect your wallet, and select your preferred wallet provider.
        </Text>
        <Text>Once your wallet is connected, you are ready to:</Text>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>
            lock NEAR for veNEAR (
            <Link
              className="text-primary underline hover:text-secondary font-medium"
              href="/assets"
            >
              connect your wallet and follow the process to lock
            </Link>
            )
          </li>
          <li>
            accumulate voting power (
            <Link
              className="text-primary underline hover:text-secondary font-medium"
              href="/assets#lock"
            >
              learn more here
            </Link>
            )
          </li>
          <li>
            participate in governance (
            <Link
              className="text-primary underline hover:text-secondary font-medium"
              href="/proposals"
            >
              learn more here
            </Link>
            )
          </li>
          <li>
            earn veNEAR rewards (
            <Link
              className="text-primary underline hover:text-secondary font-medium"
              href="/assets"
            >
              learn more here
            </Link>
            )
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "fireblocks-vaults",
    question: "Using Fireblocks vaults",
    answer: (
      <div className="space-y-6">
        <Text>
          If you are using a Fireblocks vault, please note the following:
        </Text>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>
            To connect to the House of Stake contracts, your Fireblocks
            workspace must allow <strong>typed messages</strong>.
          </li>
          <li>
            Make sure you have configured an appropriate policy in your
            Fireblocks Console.
          </li>
        </ul>
        <Text>
          If you would like to become a delegate using a Fireblocks vault, note
          that delegate statements are not supported for Fireblocks vaults.
        </Text>
        <div className="pl-4">
          <Text>You can:</Text>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>vote as a delegate without publishing a statement, or</li>
            <li>
              delegate your voting power to a regular wallet that has a delegate
              statement set up (
              <Link
                className="text-primary underline hover:text-secondary font-medium"
                href="/delegates"
              >
                see example here
              </Link>
              ).
            </li>
          </ul>
        </div>
        <Text>
          In case you need support, please reach out to House of Stake on
          Telegram or on X.
        </Text>
      </div>
    ),
  },
];

const InfoFAQ = () => {
  const searchParams = useSearchParams();
  const faqId = searchParams?.get("item");
  const isValidFaqId =
    faqId &&
    [...generalFaqs, ...rewardsFaqs, ...walletFaqs].some(
      (faq) => faq.id === faqId
    );
  const [openItem, setOpenItem] = useState<string | undefined>(
    isValidFaqId ? faqId : undefined
  );

  useEffect(() => {
    // Check if there's a valid FAQ ID in the query params
    if (isValidFaqId && faqId) {
      setOpenItem(faqId);
      setTimeout(() => {
        const element = document.getElementById(faqId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  }, [faqId, isValidFaqId]);

  const handleToggle = useCallback((value: string) => {
    setOpenItem(value);
    if (value) {
      const faq = [...generalFaqs, ...rewardsFaqs, ...walletFaqs].find(
        (f) => f.id === value
      );
      trackEvent({
        event_name: MixpanelEvents.FAQExpanded,
        event_data: { id: value, question: faq?.question },
      });
    }
  }, []);

  return (
    <div className="mt-16 w-full">
      <div className="mx-auto">
        <section className="mb-16" id="ve-near-rewards">
          <h3 className="text-3xl font-black text-primary mb-10">
            FAQs | veNEAR Rewards
          </h3>

          {rewardsFaqs.length > 0 ? (
            <Accordion
              type="single"
              collapsible
              className="space-y-4"
              value={openItem}
              onValueChange={handleToggle}
            >
              {rewardsFaqs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  id={faq.id}
                  className="w-full border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow data-[state=open]:shadow-md"
                >
                  <AccordionTrigger className="w-full text-left text-primary hover:text-secondary text-base font-semibold px-8 py-6 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="w-full text-base leading-relaxed px-8 pb-8 pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="w-full bg-[#5EA5F5] rounded-lg p-12 text-white">
              <div className="text-xl font-medium">
                <br />
                FAQs about veNEAR Rewards
                <br />
              </div>
            </div>
          )}
        </section>

        <section className="mb-16">
          <h3 className="text-3xl font-black text-primary mb-10">
            FAQs | Voting
          </h3>

          <div className="space-y-8">
            <div>
              <h4 className="text-xl font-bold text-primary mb-6">Wallets</h4>
              <Accordion
                type="single"
                collapsible
                className="space-y-4"
                value={openItem}
                onValueChange={handleToggle}
              >
                {walletFaqs.map((faq) => (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    id={faq.id}
                    className="w-full border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow data-[state=open]:shadow-md"
                  >
                    <AccordionTrigger className="w-full text-left text-primary hover:text-secondary text-base font-semibold px-8 py-6 hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="w-full text-base leading-relaxed px-8 pb-8 pt-2">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div>
              <h4 className="text-xl font-bold text-primary mb-6">General</h4>
              <Accordion
                type="single"
                collapsible
                className="space-y-4"
                value={openItem}
                onValueChange={handleToggle}
              >
                {generalFaqs.map((faq) => (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    id={faq.id}
                    className="w-full border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow data-[state=open]:shadow-md"
                  >
                    <AccordionTrigger className="w-full text-left text-primary hover:text-secondary text-base font-semibold px-8 py-6 hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="w-full text-base leading-relaxed px-8 pb-8 pt-2">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          <div className="mt-12 text-base text-tertiary bg-gray-50 rounded-lg p-6">
            <Text>
              Have more questions? Join the discussion on our{" "}
              <ExternalLink href="https://gov.near.org/">
                Governance Forum
              </ExternalLink>{" "}
              or{" "}
              <ExternalLink href="https://discord.gg/nearprotocol">
                Discord
              </ExternalLink>
              .
            </Text>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InfoFAQ;
