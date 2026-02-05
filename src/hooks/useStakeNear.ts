import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { CONTRACTS } from "@/lib/contractConstants";
import { READ_NEAR_CONTRACT_QK } from "@/hooks/useReadHOSContract";
import { STAKED_BALANCE_QK } from "./useStakedBalance";
import { UNSTAKED_BALANCE_QK } from "./useUnstakedBalance";
import { useWriteHOSContract } from "./useWriteHOSContract";

type Props = {
  lockupAccountId: string;
};

export const useStakeNear = ({ lockupAccountId }: Props) => {
  const [isStakingNear, setIsStakingNear] = useState(false);
  const [isUnstakingNear, setIsUnstakingNear] = useState(false);
  const [isWithdrawingNear, setIsWithdrawingNear] = useState(false);
  const [stakingNearError, setStakingNearError] = useState<Error | null>(null);
  const [unstakingNearError, setUnstakingNearError] = useState<Error | null>(
    null
  );
  const [withdrawingNearError, setWithdrawingNearError] =
    useState<Error | null>(null);

  const [isDeletingLockup, setIsDeletingLockup] = useState(false);
  const [deleteLockupError, setDeleteLockupError] = useState<Error | null>(
    null
  );

  const [isUnstakingAll, setIsUnstakingAll] = useState(false);
  const [isWithdrawingAll, setIsWithdrawingAll] = useState(false);
  const [unstakingAllError, setUnstakingAllError] = useState<Error | null>(
    null
  );
  const [withdrawingAllError, setWithdrawingAllError] = useState<Error | null>(
    null
  );

  const { mutateAsync: mutateStakeNear } = useWriteHOSContract({
    contractType: "LOCKUP",
  });

  const queryClient = useQueryClient();

  const stakeNear = useCallback(
    async (amount: string) => {
      try {
        setIsStakingNear(true);
        setStakingNearError(null);

        await mutateStakeNear({
          contractId: lockupAccountId,
          methodCalls: [
            {
              methodName: "deposit_and_stake",
              args: { amount },
            },
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [READ_NEAR_CONTRACT_QK, lockupAccountId],
        });

        queryClient.invalidateQueries({
          queryKey: [STAKED_BALANCE_QK, lockupAccountId],
        });
      } catch (e) {
        console.error("[stakeNear] error", e);
        setStakingNearError(e as Error);
        throw e;
      } finally {
        setIsStakingNear(false);
      }
    },
    [mutateStakeNear, lockupAccountId, queryClient]
  );

  const unstakeNear = useCallback(
    async (amount: string) => {
      try {
        setIsUnstakingNear(true);
        setUnstakingNearError(null);

        await mutateStakeNear({
          contractId: lockupAccountId,
          methodCalls: [
            {
              methodName: "unstake",
              args: { amount },
            },
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [READ_NEAR_CONTRACT_QK, lockupAccountId],
        });

        queryClient.invalidateQueries({
          queryKey: [STAKED_BALANCE_QK],
        });

        queryClient.invalidateQueries({
          queryKey: [UNSTAKED_BALANCE_QK],
        });
      } catch (e) {
        console.error("[unstakeNear] error", e);
        setUnstakingNearError(e as Error);
        throw e;
      } finally {
        setIsUnstakingNear(false);
      }
    },
    [mutateStakeNear, lockupAccountId, queryClient]
  );

  const withdrawNear = useCallback(
    async (amount: string) => {
      try {
        setIsWithdrawingNear(true);
        setWithdrawingNearError(null);

        await mutateStakeNear({
          contractId: lockupAccountId,
          methodCalls: [
            {
              methodName: "withdraw_from_staking_pool",
              args: { amount },
            },
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [READ_NEAR_CONTRACT_QK, lockupAccountId],
        });

        queryClient.invalidateQueries({
          queryKey: [UNSTAKED_BALANCE_QK],
        });
      } catch (e) {
        console.error("[withdrawNear] error", e);
        setWithdrawingNearError(e as Error);
        throw e;
      } finally {
        setIsWithdrawingNear(false);
      }
    },
    [mutateStakeNear, lockupAccountId, queryClient]
  );

  const unstakeAll = useCallback(async () => {
    try {
      setIsUnstakingAll(true);
      setUnstakingAllError(null);

      await mutateStakeNear({
        contractId: lockupAccountId,
        methodCalls: [
          {
            methodName: "unstake_all",
            args: {},
          },
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [READ_NEAR_CONTRACT_QK, lockupAccountId],
      });

      queryClient.invalidateQueries({
        queryKey: [STAKED_BALANCE_QK],
      });

      queryClient.invalidateQueries({
        queryKey: [UNSTAKED_BALANCE_QK],
      });
    } catch (e) {
      console.error("[unstakeAll] error", e);
      setUnstakingAllError(e as Error);
      throw e;
    } finally {
      setIsUnstakingAll(false);
    }
  }, [mutateStakeNear, lockupAccountId, queryClient]);

  const withdrawAll = useCallback(async () => {
    try {
      setIsWithdrawingAll(true);
      setWithdrawingAllError(null);

      await mutateStakeNear({
        contractId: lockupAccountId,
        methodCalls: [
          {
            methodName: "withdraw_all_from_staking_pool",
            args: {},
          },
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [READ_NEAR_CONTRACT_QK, lockupAccountId],
      });
    } catch (e) {
      console.error("[withdrawAll] error", e);
      setWithdrawingAllError(e as Error);
      throw e;
    } finally {
      setIsWithdrawingAll(false);
    }
  }, [mutateStakeNear, lockupAccountId, queryClient]);

  const deleteLockup = useCallback(async () => {
    try {
      setIsDeletingLockup(true);
      setDeleteLockupError(null);

      await mutateStakeNear({
        contractId: lockupAccountId,
        methodCalls: [
          {
            methodName: "delete_lockup",
            args: {},
          },
        ],
      });

      await queryClient.invalidateQueries({
        queryKey: [READ_NEAR_CONTRACT_QK, lockupAccountId],
      });

      await queryClient.invalidateQueries({
        queryKey: [READ_NEAR_CONTRACT_QK, CONTRACTS.VENEAR_CONTRACT_ID],
      });
    } catch (e) {
      console.error("[deleteLockup] error", e);
      setDeleteLockupError(e as Error);
      throw e;
    } finally {
      setIsDeletingLockup(false);
    }
  }, [mutateStakeNear, lockupAccountId, queryClient]);

  return {
    stakeNear,
    unstakeNear,
    unstakeAll,
    withdrawNear,
    withdrawAll,
    deleteLockup,
    isStakingNear,
    isUnstakingNear,
    isUnstakingAll,
    isWithdrawingNear,
    isWithdrawingAll,
    isDeletingLockup,
    stakingNearError,
    unstakingNearError,
    unstakingAllError,
    withdrawingNearError,
    withdrawingAllError,
    deleteLockupError,
  };
};
