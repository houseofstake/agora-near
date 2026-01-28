"use client";

import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useNear } from "@/contexts/NearContext";
import { useCastVote } from "@/hooks/useCastVote";
import { useCreateProposal } from "@/hooks/useCreateProposal";
import { useDelegateAll } from "@/hooks/useDelegateAll";
import { useLockNear } from "@/hooks/useLockNear";
import { useLockupAccount } from "@/hooks/useLockupAccount";
import { useProposalActions } from "@/hooks/useProposalActions";
import { useProposalConfig } from "@/hooks/useProposalConfig";
import { useProposals } from "@/hooks/useProposals";
import { useReadHOSContract } from "@/hooks/useReadHOSContract";
import { useSelectStakingPool } from "@/hooks/useSelectStakingPool";
import { useStakeNear } from "@/hooks/useStakeNear";
import { useUndelegate } from "@/hooks/useUndelegate";
import { useUnlockNear } from "@/hooks/useUnlockNear";
import { useVenearAccountStats } from "@/hooks/useVenearAccountStats";
import { useVenearStats } from "@/hooks/useVenearStats";
import {
  LINEAR_TOKEN_CONTRACT,
  STNEAR_TOKEN_CONTRACT,
  RNEAR_TOKEN_CONTRACT,
} from "@/lib/constants";
import { CONTRACTS } from "@/lib/contractConstants";
import { ProposalInfo } from "@/lib/contracts/types/voting";
import { convertUnit } from "@fastnear/utils";
import { SignAndSendTransactionParams } from "@hot-labs/near-connect/build/types";
import Big from "big.js";
import { utils } from "near-api-js";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";

export default function VeNearDebugCards() {
  const { signedAccountId, signAndSendTransactions, viewMethod } = useNear();
  const { data: contractInfo, isLoading: isLoadingContractInfo } =
    useVenearStats();
  const { data: accountInfo, isLoading: isLoadingAccount } =
    useVenearAccountStats(signedAccountId);
  const { lockupAccountId, isLoading: isLoadingLockupAccountId } =
    useLockupAccount();

  const openDialog = useOpenDialog();

  const { lockNear, isLockingNear, lockingNearError } = useLockNear({
    lockupAccountId: accountInfo?.lockupAccountId || "",
  });

  const {
    stakeNear,
    unstakeNear,
    withdrawNear,
    isStakingNear,
    isUnstakingNear,
    isWithdrawingNear,
    stakingNearError,
    unstakingNearError,
    withdrawingNearError,
  } = useStakeNear({
    lockupAccountId: accountInfo?.lockupAccountId || "",
  });

  const [{ data: knownDepositedBalance }] = useReadHOSContract([
    {
      contractId: accountInfo?.lockupAccountId || "",
      methodName: "get_known_deposited_balance",
      config: {
        args: {},
        enabled: !!accountInfo,
      },
    },
  ]);

  const [stakeAmount, setStakeAmount] = useState("");
  const [lockAmount, setLockAmount] = useState("");
  const [unlockAmount, setUnlockAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [delegateAddress, setDelegateAddress] = useState("");

  const { proposals, isFetching: isLoadingProposals } = useProposals({
    pageSize: 50,
  });
  const { config, isLoading: isLoadingConfig } = useProposalConfig();
  const { approveProposal, isApprovingProposal, approveProposalError } =
    useProposalActions({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [votingOptions, setVotingOptions] = useState(["Yes", "No"]);
  const { createProposal, isCreatingProposal, createProposalError } =
    useCreateProposal({
      baseFee: config?.base_proposal_fee || "0",
      storageFee: config?.vote_storage_fee || "0",
    });
  const { castVote, isVoting, error: votingError } = useCastVote({});
  const [selectedVotes, setSelectedVotes] = useState<Record<number, number>>(
    {}
  );

  const lockedNear = Big(accountInfo?.totalBalance.near || "0").plus(
    accountInfo?.totalBalance.extraBalance || "0"
  );

  const {
    delegateAll,
    isDelegating,
    error: delegationError,
  } = useDelegateAll({
    delegateVotingPower: lockedNear,
    currentDelegateeAddress: accountInfo?.delegation?.delegatee,
  });

  const {
    undelegate,
    isUndelegating,
    error: undelegationError,
  } = useUndelegate({
    delegateVotingPower: lockedNear,
    delegateeAddress: accountInfo?.delegation?.delegatee ?? "",
  });

  const lockAllNear = useCallback(() => {
    if (accountInfo?.lockupAccountId) {
      lockNear({});
    }
  }, [accountInfo?.lockupAccountId, lockNear]);

  const { beginUnlockNear, isUnlockingNear, unlockingNearError } =
    useUnlockNear({
      lockupAccountId: accountInfo?.lockupAccountId ?? "",
    });

  const unlockAllNear = useCallback(() => {
    if (accountInfo?.lockupAccountId) {
      beginUnlockNear({});
    }
  }, [accountInfo?.lockupAccountId, beginUnlockNear]);

  const handleLockAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setLockAmount(value);
    }
  };

  const handleUnlockAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setUnlockAmount(value);
    }
  };

  const handleLockSpecificAmount = () => {
    if (!lockAmount || !accountInfo?.lockupAccountId) return;
    try {
      const yoctoAmount = utils.format.parseNearAmount(lockAmount);
      if (!yoctoAmount) throw new Error("Invalid amount");
      lockNear({ amount: yoctoAmount });
    } catch (error) {
      console.error("Error converting lock amount:", error);
    }
  };

  const handleUnlockSpecificAmount = () => {
    if (!unlockAmount || !accountInfo?.lockupAccountId) return;
    try {
      const yoctoAmount = utils.format.parseNearAmount(unlockAmount);
      if (!yoctoAmount) throw new Error("Invalid amount");
      beginUnlockNear({ amount: yoctoAmount });
    } catch (error) {
      console.error("Error converting unlock amount:", error);
    }
  };

  const { selectStakingPoolAsync } = useSelectStakingPool({
    lockupAccountId: accountInfo?.lockupAccountId || "",
  });

  const handleStakeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimals
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setStakeAmount(value);
    }
  };

  const handleStake = async () => {
    if (!stakeAmount) return;
    try {
      const yoctoAmount = utils.format.parseNearAmount(stakeAmount);
      if (!yoctoAmount) throw new Error("Invalid amount");
      // If no pool selected, choose a default based on current network and available LST envs
      if (!accountInfo?.stakingPool) {
        const preferredPool =
          RNEAR_TOKEN_CONTRACT ||
          STNEAR_TOKEN_CONTRACT ||
          LINEAR_TOKEN_CONTRACT;
        if (preferredPool) {
          await selectStakingPoolAsync({ stakingPoolId: preferredPool });
        }
      }
      stakeNear(yoctoAmount);
    } catch (error) {
      console.error("Error converting stake amount:", error);
    }
  };

  const handleUnstakeAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setUnstakeAmount(value);
    }
  };

  const handleUnstake = () => {
    if (!unstakeAmount) return;
    try {
      const yoctoAmount = utils.format.parseNearAmount(unstakeAmount);
      if (!yoctoAmount) throw new Error("Invalid amount");
      unstakeNear(yoctoAmount);
    } catch (error) {
      console.error("Error converting unstake amount:", error);
    }
  };

  const handleWithdrawAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setWithdrawAmount(value);
    }
  };

  const handleWithdraw = () => {
    if (!withdrawAmount) return;
    try {
      const yoctoAmount = utils.format.parseNearAmount(withdrawAmount);
      if (!yoctoAmount) throw new Error("Invalid amount");
      withdrawNear(yoctoAmount);
    } catch (error) {
      console.error("Error converting withdraw amount:", error);
    }
  };

  const handleVote = async (proposalId: number, voteIndex: number) => {
    if (!config?.vote_storage_fee || !proposals) return;

    const proposal = proposals.find((p) => p.id === proposalId);
    if (!proposal?.snapshot_and_state?.snapshot.block_height) {
      console.error("No snapshot block height found for proposal");
      return;
    }

    try {
      await castVote({
        proposalId,
        voteIndex,
        blockId: proposal.snapshot_and_state.snapshot.block_height,
        voteStorageFee: config.vote_storage_fee,
      });
      // Clear the selected vote after successful submission
      setSelectedVotes((prev) => {
        const next = { ...prev };
        delete next[proposalId];
        return next;
      });
    } catch (error) {
      toast.error(`Error casting vote: ${error}`, {
        duration: 5000,
      });
    }
  };

  const calculateVotingStats = (proposal: ProposalInfo) => {
    if (!proposal.snapshot_and_state) return null;

    const totalVotingPower = proposal.snapshot_and_state.total_venear;

    const votingPowerPercentage = Big(proposal.total_votes.total_venear)
      .div(Big(totalVotingPower))
      .mul(100)
      .toFixed(2);

    const accountParticipationPercentage = String(
      (proposal.total_votes.total_votes /
        proposal.snapshot_and_state.snapshot.length) *
        100
    );

    return {
      votingPowerPercentage,
      accountParticipationPercentage,
    };
  };

  const handleDelegateAll = () => {
    if (!delegateAddress) return;
    delegateAll(delegateAddress);
  };

  const handleUndelegate = () => {
    undelegate();
  };

  const batchedOnboardWithNear = async () => {
    try {
      await signAndSendTransactions({
        transactions: [
          {
            receiverId: CONTRACTS.VENEAR_CONTRACT_ID,
            actions: [
              {
                type: "FunctionCall",
                params: {
                  methodName: "storage_deposit",
                  args: { account_id: signedAccountId },
                  gas: convertUnit("30 Tgas"),
                  deposit: convertUnit(
                    contractInfo?.storageDepositAmount || "0"
                  ),
                },
              },
              {
                type: "FunctionCall",
                params: {
                  methodName: "deploy_lockup",
                  args: {},
                  gas: convertUnit("100 Tgas"),
                  deposit: convertUnit(
                    contractInfo?.lockupDeploymentCost || "0"
                  ),
                },
              },
            ],
          },
          {
            receiverId: lockupAccountId || "",
            actions: [
              {
                type: "Transfer",
                params: {
                  deposit: "100000000000000000000000",
                },
              },
              {
                type: "FunctionCall",
                params: {
                  methodName: "lock_near",
                  args: {
                    amount: "100000000000000000000000",
                  },
                  gas: convertUnit("100 Tgas"),
                  deposit: convertUnit("1"),
                },
              },
            ],
          },
        ],
      });
    } catch (e) {
      console.error("Onboarding failed:", e);
    }
  };

  const batchedOnboardWithLST = async () => {
    try {
      const minStorageDeposit = (await viewMethod({
        contractId: LINEAR_TOKEN_CONTRACT,
        method: "storage_balance_bounds",
        args: {},
      })) as
        | {
            min?: string;
            max?: string;
          }
        | null
        | undefined;

      const ftTransferTransactions: SignAndSendTransactionParams[] = [
        {
          signerId: signedAccountId ?? "",
          receiverId: LINEAR_TOKEN_CONTRACT,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "storage_deposit",
                args: {
                  account_id: lockupAccountId ?? "",
                  registration_only: true,
                },
                gas: convertUnit("30 Tgas"),
                deposit: minStorageDeposit?.min ?? convertUnit("0.01 NEAR"),
              },
            },
          ],
        },
        {
          signerId: signedAccountId ?? "",
          receiverId: LINEAR_TOKEN_CONTRACT,
          actions: [
            {
              type: "FunctionCall",
              params: {
                methodName: "ft_transfer",
                args: {
                  receiver_id: lockupAccountId || "",
                  amount: "100000000000000000000000",
                  memo: "",
                },
                gas: convertUnit("30 Tgas"),
                deposit: convertUnit("1 yoctoNEAR"),
              },
            },
          ],
        },
      ];

      await signAndSendTransactions({
        transactions: [
          {
            receiverId: CONTRACTS.VENEAR_CONTRACT_ID,
            actions: [
              {
                type: "FunctionCall",
                params: {
                  methodName: "storage_deposit",
                  args: { account_id: signedAccountId },
                  gas: convertUnit("30 Tgas"),
                  deposit: convertUnit(
                    contractInfo?.storageDepositAmount || "0"
                  ),
                },
              },
              {
                type: "FunctionCall",
                params: {
                  methodName: "deploy_lockup",
                  args: {},
                  gas: convertUnit("100 Tgas"),
                  deposit: convertUnit(
                    contractInfo?.lockupDeploymentCost || "0"
                  ),
                },
              },
            ],
          },
          ...ftTransferTransactions,
          {
            receiverId: lockupAccountId || "",
            actions: [
              {
                type: "FunctionCall",
                params: {
                  methodName: "select_staking_pool",
                  args: {
                    staking_pool_account_id: LINEAR_TOKEN_CONTRACT,
                  },
                  gas: convertUnit("75 Tgas"),
                  deposit: convertUnit("1"),
                },
              },
            ],
          },
          {
            receiverId: lockupAccountId || "",
            actions: [
              {
                type: "FunctionCall",
                params: {
                  methodName: "refresh_staking_pool_balance",
                  args: {},
                  gas: convertUnit("75 Tgas"),
                  deposit: convertUnit("1"),
                },
              },
            ],
          },
          {
            receiverId: lockupAccountId || "",
            actions: [
              {
                type: "FunctionCall",
                params: {
                  methodName: "lock_near",
                  args: {
                    amount: "100000000000000000000000",
                  },
                  gas: convertUnit("100 Tgas"),
                  deposit: convertUnit("1"),
                },
              },
            ],
          },
        ],
      });
    } catch (e) {
      console.error("Onboarding failed:", e);
    }
  };

  const renderContractInfo = () => (
    <Card className="flex flex-col grow">
      <CardHeader>
        <CardTitle>veNEAR Contract Information</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingContractInfo ? (
          <LoadingState />
        ) : (
          <div className="space-y-4">
            <InfoItem
              label="Total veNEAR Supply"
              value={utils.format.formatNearAmount(
                contractInfo?.totalSupply || "0"
              )}
              unit="veNEAR"
            />
            <Separator />
            <InfoItem
              label="Lockup Storage Cost"
              value={utils.format.formatNearAmount(
                contractInfo?.lockupDeploymentCost || "0"
              )}
              unit="NEAR"
            />
            <Separator />
            <InfoItem
              label="Minimum Account Deposit"
              value={utils.format.formatNearAmount(
                contractInfo?.storageDepositAmount || "0"
              )}
              unit="NEAR"
            />
            <Separator />
            <InfoItem
              label="Staking Pool Whitelist Contract ID"
              value={contractInfo?.stakingPoolWhitelistId || "N/A"}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderAccountInfo = () => (
    <Card className="flex flex-col grow">
      <CardHeader>
        <CardTitle>Your veNEAR Account</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="my-2">
          <Button
            loading={isLoadingLockupAccountId}
            onClick={batchedOnboardWithNear}
          >
            Batched onboard
          </Button>
          <Button
            loading={isLoadingLockupAccountId}
            onClick={batchedOnboardWithLST}
          >
            Batched LST onboard
          </Button>
          <Button
            onClick={() =>
              openDialog({
                type: "NEAR_LOCK",
                params: {
                  source: accountInfo ? "account_management" : "onboarding",
                },
              })
            }
          >
            Open locking modal
          </Button>
          <Button
            onClick={() =>
              openDialog({
                type: "NEAR_UNLOCK",
                params: {},
              })
            }
          >
            Open unlock modal
          </Button>
        </div>
        {isLoadingAccount ? (
          <LoadingState />
        ) : accountInfo ? (
          <div className="space-y-4">
            {accountInfo.lockupAccountId && (
              <InfoItem
                label="Lockup Account ID"
                value={accountInfo.lockupAccountId}
              />
            )}
            <Separator />
            <InfoItem
              label="veNEAR Total Balance (Principal + Earned)"
              value={utils.format.formatNearAmount(
                accountInfo.veNearBalance || "0"
              )}
              unit="veNEAR"
            />
            <InfoItem
              label="Principal Balance"
              value={utils.format.formatNearAmount(
                accountInfo.totalBalance.near
              )}
              unit="veNEAR"
            />
            <InfoItem
              label="Earned veNEAR"
              value={utils.format.formatNearAmount(
                accountInfo.totalBalance.extraBalance
              )}
              unit="veNEAR"
            />

            <Separator />
            <div className="flex flex-col gap-4">
              <CardTitle>Delegation</CardTitle>
              <InfoItem
                label="Delegated NEAR Balance"
                value={utils.format.formatNearAmount(
                  accountInfo.delegatedBalance.near
                )}
                unit="NEAR"
              />
              <InfoItem
                label="Delegated Rewards Balance"
                value={utils.format.formatNearAmount(
                  accountInfo.delegatedBalance.extraBalance
                )}
                unit="NEAR"
              />
              {accountInfo.delegation ? (
                <>
                  <InfoItem
                    label="Delegated To"
                    value={accountInfo.delegation.delegatee}
                  />
                  <Button
                    loading={isUndelegating}
                    onClick={handleUndelegate}
                    variant="destructive"
                  >
                    Undelegate All
                  </Button>
                  {undelegationError && (
                    <p className="text-red-500 text-sm">{`Error: ${undelegationError.message}`}</p>
                  )}
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Input
                    type="text"
                    placeholder="Enter delegate account ID"
                    value={delegateAddress}
                    onChange={(e) => setDelegateAddress(e.target.value)}
                  />
                  <Button
                    loading={isDelegating}
                    onClick={handleDelegateAll}
                    disabled={!delegateAddress}
                  >
                    Delegate All
                  </Button>
                  {delegationError && (
                    <p className="text-red-500 text-sm">{`Error: ${delegationError.message}`}</p>
                  )}
                </div>
              )}
            </div>
            <Separator />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );

  const renderLockUnlockActions = () => {
    if (!accountInfo) return null;
    return (
      <Card className="flex flex-col grow">
        <CardHeader>
          <CardTitle>Lock/unlock NEAR</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-2">
              <div className="flex flex-col gap-3 p-4 border rounded-lg">
                <h3 className="font-semibold">Lock NEAR</h3>
                {accountInfo.veNearLiquidBalance && (
                  <InfoItem
                    label="Available to lock"
                    value={utils.format.formatNearAmount(
                      accountInfo.veNearLiquidBalance
                    )}
                    unit="NEAR"
                  />
                )}

                {accountInfo.veNearLockedBalance && (
                  <InfoItem
                    label="veNEAR Locked Balance"
                    value={utils.format.formatNearAmount(
                      accountInfo.veNearLockedBalance
                    )}
                    unit="veNEAR"
                  />
                )}
                <Input
                  type="text"
                  placeholder="Amount to lock"
                  value={lockAmount}
                  onChange={handleLockAmountChange}
                  className="w-full"
                />
                <div className="flex flex-col gap-2">
                  <Button
                    loading={isLockingNear}
                    onClick={handleLockSpecificAmount}
                    disabled={isLockingNear || !lockAmount}
                    className="w-full"
                  >
                    Lock Amount
                  </Button>
                  <Button
                    loading={isLockingNear}
                    onClick={lockAllNear}
                    disabled={isLockingNear}
                    variant="outline"
                    className="w-full"
                  >
                    Lock All
                  </Button>
                </div>
                {lockingNearError && (
                  <p className="text-red-500 text-sm">{`Error: ${lockingNearError.message}`}</p>
                )}
              </div>
              <div className="flex flex-col gap-3 p-4 border rounded-lg">
                <h3 className="font-semibold">Unlock veNEAR</h3>
                {accountInfo.veNearPendingBalance && (
                  <InfoItem
                    label="Pending to unlock"
                    value={utils.format.formatNearAmount(
                      accountInfo.veNearPendingBalance
                    )}
                    unit="veNEAR"
                  />
                )}
                {accountInfo.veNearUnlockTimestamp && (
                  <InfoItem
                    label="Time until veNEAR is unlocked"
                    value={String(
                      Math.max(
                        0,
                        parseFloat(accountInfo.veNearUnlockTimestamp || "0") /
                          1e6 -
                          new Date().getTime()
                      )
                    )}
                    isRaw
                  />
                )}
                <Input
                  type="text"
                  placeholder="Amount to unlock"
                  value={unlockAmount}
                  onChange={handleUnlockAmountChange}
                  className="w-full"
                />
                <div className="flex flex-col gap-2">
                  <Button
                    loading={isUnlockingNear}
                    onClick={handleUnlockSpecificAmount}
                    disabled={isUnlockingNear || !unlockAmount}
                    className="w-full"
                  >
                    Unlock Amount
                  </Button>
                  <Button
                    loading={isUnlockingNear}
                    onClick={unlockAllNear}
                    disabled={isUnlockingNear}
                    variant="outline"
                    className="w-full"
                  >
                    Unlock All
                  </Button>
                </div>
                {unlockingNearError && (
                  <p className="text-red-500 text-sm">{`Error: ${unlockingNearError.message}`}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderStakeActions = () => {
    if (!accountInfo) return null;
    return (
      <Card className="flex flex-col grow">
        <CardHeader>
          <CardTitle>Stake/unstake NEAR</CardTitle>
          <Button
            onClick={() =>
              openDialog({
                type: "NEAR_STAKING",
                params: {
                  source: "onboarding",
                },
              })
            }
          >
            Open staking modal
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-2">
              <div className="flex flex-col gap-3 p-4 border rounded-lg">
                <h3 className="font-semibold">Stake NEAR</h3>
                <InfoItem
                  label="Available to stake balance"
                  value={utils.format.formatNearAmount(
                    accountInfo.liquidBalance || "0"
                  )}
                  unit="NEAR"
                />
                {accountInfo.stakingPool && (
                  <>
                    <InfoItem
                      label="Selected Staking Pool"
                      value={accountInfo.stakingPool}
                    />
                  </>
                )}
                <Input
                  type="text"
                  placeholder="Amount to stake"
                  value={stakeAmount}
                  onChange={handleStakeAmountChange}
                  className="w-full"
                />
                <Button
                  loading={isStakingNear}
                  onClick={handleStake}
                  disabled={isStakingNear || !stakeAmount}
                  className="w-full"
                >
                  Stake NEAR
                </Button>
                {stakingNearError && (
                  <p className="text-red-500 text-sm">{`Error: ${stakingNearError.message}`}</p>
                )}
              </div>

              <div className="flex flex-col gap-3 p-4 border rounded-lg">
                <h3 className="font-semibold">Unstake NEAR</h3>
                <InfoItem
                  label="Known deposited balance"
                  value={utils.format.formatNearAmount(
                    knownDepositedBalance || "0"
                  )}
                  unit="NEAR"
                />
                <Input
                  type="text"
                  placeholder="Amount to unstake"
                  value={unstakeAmount}
                  onChange={handleUnstakeAmountChange}
                  className="w-full"
                />
                <Button
                  loading={isUnstakingNear}
                  onClick={handleUnstake}
                  disabled={isUnstakingNear || !unstakeAmount}
                  className="w-full"
                >
                  Unstake NEAR
                </Button>
                {unstakingNearError && (
                  <p className="text-red-500 text-sm">{`Error: ${unstakingNearError.message}`}</p>
                )}
              </div>

              <div className="flex flex-col gap-3 p-4 border rounded-lg">
                <h3 className="font-semibold">Withdraw Unstaked NEAR</h3>
                <Input
                  type="text"
                  placeholder="Amount to withdraw"
                  value={withdrawAmount}
                  onChange={handleWithdrawAmountChange}
                  className="w-full"
                />
                <Button
                  loading={isWithdrawingNear}
                  onClick={handleWithdraw}
                  disabled={isWithdrawingNear || !withdrawAmount}
                  className="w-full"
                >
                  Withdraw NEAR
                </Button>
                {withdrawingNearError && (
                  <p className="text-red-500 text-sm">{`Error: ${withdrawingNearError.message}`}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderProposals = () => {
    const handleSubmit = async () => {
      await createProposal({
        title,
        description,
        link,
        voting_options: votingOptions,
      });
      // Reset form
      setTitle("");
      setDescription("");
      setLink("");
      setVotingOptions(["Yes", "No"]);
      setShowCreateForm(false);
    };

    const handleVotingOptionChange = (index: number, value: string) => {
      const newOptions = [...votingOptions];
      newOptions[index] = value;
      setVotingOptions(newOptions);
    };

    const addVotingOption = () => {
      setVotingOptions([...votingOptions, ""]);
    };

    const removeVotingOption = (index: number) => {
      setVotingOptions(votingOptions.filter((_, i) => i !== index));
    };

    return (
      <Card className="flex flex-col grow">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Proposals</CardTitle>
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              {showCreateForm ? "Cancel" : "Create New Proposal"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showCreateForm && (
            <div className="mb-8 p-4 border rounded-lg space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Create Proposal</h3>
                <p className="text-sm text-muted-foreground">
                  Create a new proposal for the community to vote on.
                </p>
              </div>

              {isLoadingConfig ? (
                <LoadingState />
              ) : config ? (
                <div className="space-y-4 py-2">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <InfoItem
                      label="Base Proposal Fee"
                      value={utils.format.formatNearAmount(
                        config.base_proposal_fee
                      )}
                      unit="NEAR"
                    />
                    <InfoItem
                      label="Vote Storage Fee"
                      value={utils.format.formatNearAmount(
                        config.vote_storage_fee
                      )}
                      unit="NEAR"
                    />
                    <InfoItem
                      label="Max Voting Options"
                      value={config.max_number_of_voting_options.toString()}
                    />
                    <InfoItem
                      label="Voting Duration"
                      value={`${parseInt(config.voting_duration_ns) / 1e9 / (60 * 60 * 24)} days`}
                      isRaw
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Title
                      </label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter proposal title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full min-h-[100px] p-2 border rounded-md"
                        placeholder="Enter proposal description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Link
                      </label>
                      <Input
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="Enter proposal link"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Voting Options (Max:{" "}
                        {config.max_number_of_voting_options})
                      </label>
                      <div className="space-y-2">
                        {votingOptions.map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={option}
                              onChange={(e) =>
                                handleVotingOptionChange(index, e.target.value)
                              }
                              placeholder="Enter option"
                            />
                            {votingOptions.length > 2 && (
                              <Button
                                onClick={() => removeVotingOption(index)}
                                variant="outline"
                                size="icon"
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        ))}
                        {votingOptions.length <
                          config.max_number_of_voting_options && (
                          <Button
                            onClick={addVotingOption}
                            variant="outline"
                            className="w-full"
                          >
                            Add Option
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {createProposalError && (
                <p className="text-red-500 text-sm">
                  {createProposalError.message}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isCreatingProposal}>
                  {isCreatingProposal ? "Creating..." : "Create Proposal"}
                </Button>
              </div>
            </div>
          )}

          {isLoadingProposals ? (
            <LoadingState />
          ) : (
            <div className="space-y-4">
              {proposals?.map((proposal) => {
                const votingStats = calculateVotingStats(proposal);
                return (
                  <div
                    key={proposal.id}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">
                        {proposal.title || `Proposal #${proposal.id}`}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-sm rounded-full bg-primary/10">
                          {proposal.status}
                        </span>
                        {proposal.status === "Created" && (
                          <Button
                            onClick={() => approveProposal(proposal.id)}
                            loading={isApprovingProposal}
                            variant="outline"
                            size="sm"
                          >
                            Approve
                          </Button>
                        )}
                      </div>
                    </div>
                    {approveProposalError && proposal.status === "Created" && (
                      <p className="text-red-500 text-sm">
                        {approveProposalError.message}
                      </p>
                    )}
                    {proposal.description && (
                      <p className="text-muted-foreground">
                        {proposal.description.slice(0, 50)}
                        {"..."}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <InfoItem label="Proposer" value={proposal.proposer_id} />
                      <InfoItem
                        label="Created"
                        value={new Date(
                          parseInt(proposal.creation_time_ns) / 1_000_000
                        ).toLocaleString()}
                        isRaw
                      />
                      <InfoItem
                        label="Duration"
                        value={`${parseInt(proposal.voting_duration_ns) / 1e9 / (60 * 60 * 24)} days`}
                        isRaw
                      />
                      <InfoItem
                        label="Total Votes"
                        value={proposal.votes
                          .reduce((acc, vote) => acc + vote.total_votes, 0)
                          .toString()}
                        isRaw
                      />
                      {votingStats && (
                        <>
                          <InfoItem
                            label="Voting Power Participation"
                            value={`${votingStats.votingPowerPercentage}%`}
                            isRaw
                          />
                          <InfoItem
                            label="Account Participation"
                            value={`${votingStats.accountParticipationPercentage}%`}
                            isRaw
                          />
                        </>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Voting Results</h4>
                      {proposal.votes.map((vote, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <span>{proposal.voting_options[index]}</span>
                          <div className="space-x-4">
                            <span>{vote.total_votes} votes</span>
                            <span>
                              {utils.format.formatNearAmount(vote.total_venear)}{" "}
                              veNEAR
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {proposal.link && (
                      <a
                        href={proposal.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {proposal.link}
                      </a>
                    )}

                    {proposal.status === "Voting" && (
                      <div className="mt-4 space-y-2">
                        <h4 className="font-medium">Cast Your Vote</h4>
                        <div className="flex gap-2">
                          <Select
                            value={selectedVotes[proposal.id]?.toString()}
                            onValueChange={(value) =>
                              setSelectedVotes((prev) => ({
                                ...prev,
                                [proposal.id]: parseInt(value),
                              }))
                            }
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent>
                              {proposal.voting_options.map((option, index) => (
                                <SelectItem
                                  key={index}
                                  value={index.toString()}
                                >
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            onClick={() =>
                              handleVote(
                                proposal.id,
                                selectedVotes[proposal.id]
                              )
                            }
                            disabled={
                              isVoting ||
                              selectedVotes[proposal.id] === undefined
                            }
                          >
                            {isVoting ? "Voting..." : "Vote"}
                          </Button>
                        </div>
                        {votingError && (
                          <p className="text-red-500 text-sm">
                            {votingError.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      {renderContractInfo()}
      {renderAccountInfo()}
      {renderLockUnlockActions()}
      {renderStakeActions()}
      {renderProposals()}
    </>
  );
}

const LoadingState = () => (
  <div className="space-y-4">
    <Skeleton className="h-6 w-full" />
    <Skeleton className="h-6 w-full" />
    <Skeleton className="h-6 w-full" />
    <Skeleton className="h-6 w-full" />
  </div>
);

interface InfoItemProps {
  label: string;
  value: string;
  unit?: string;
  isRaw?: boolean;
}

const InfoItem = ({ label, value, unit, isRaw }: InfoItemProps) => (
  <div className="flex flex-col gap-1">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-lg font-medium">
      {isRaw ? value : `${value}${unit ? ` ${unit}` : ""}`}
    </p>
  </div>
);
