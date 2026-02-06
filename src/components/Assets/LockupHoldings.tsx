import { useNear } from "@/contexts/NearContext";
import { useCurrentStakingPoolId } from "@/hooks/useCurrentStakingPoolId";
import { useLiquidLockupBalance } from "@/hooks/useLiquidLockupBalance";
import { useLockupAccount } from "@/hooks/useLockupAccount";
import { useLockupPendingBalance } from "@/hooks/useLockupPendingBalance";
import { useStakedBalance } from "@/hooks/useStakedBalance";
import { useStakeNear } from "@/hooks/useStakeNear";
import { useVenearAccountInfo } from "@/hooks/useVenearAccountInfo";
import { useUnstakedBalance } from "@/hooks/useUnstakedBalance";
import { filterDust } from "@/lib/tokenUtils";
import Big from "big.js";
import { memo, useMemo } from "react";
import toast from "react-hot-toast";
import { Skeleton } from "../ui/skeleton";
import { VeNearAssetRow } from "./VeNearAssetRow";
import { LockupLiquidNearRow } from "./LockupLiquidNearRow";
import { VeNearStakedAssetRow } from "./VeNearStakedAssetRow";

import { NEAR_TOKEN_METADATA } from "@/lib/constants";
import { ResponsiveAssetRow } from "./ResponsiveAssetRow";
import { TrashIcon } from "@heroicons/react/24/outline";

interface LockupHoldingsProps {
  openLockDialog: (preSelectedTokenId?: string | null) => void;
  openStakingDialog: () => void;
  openUnstakeDialog: () => void;
}

export const LockupHoldings = memo(
  ({
    openLockDialog,
    openStakingDialog,
    openUnstakeDialog,
  }: LockupHoldingsProps) => {
    const { signedAccountId } = useNear();

    const { lockupAccountId, isLoading: isLoadingLockupAccountId } =
      useLockupAccount();

    const { isLoading: isLoadingLiquidLockupBalance, liquidLockupBalance } =
      useLiquidLockupBalance({ lockupAccountId });

    const { data: accountInfo, isLoading: isLoadingAccountInfo } =
      useVenearAccountInfo(signedAccountId);

    const {
      unlockTimestamp,
      pendingBalance,
      isEligibleToUnlock,
      hasPendingBalance,
      isLoading: isLoadingLockupPendingBalance,
    } = useLockupPendingBalance({
      lockupAccountId: lockupAccountId,
    });

    const balanceWithRewards = useMemo(
      () =>
        Big(accountInfo?.totalBalance.near ?? "0")
          .add(accountInfo?.totalBalance.extraBalance ?? "0")
          .toFixed(),
      [accountInfo]
    );

    const { stakingPoolId, isLoadingStakingPoolId } = useCurrentStakingPoolId({
      lockupAccountId,
    });

    const { stakedBalance, isLoading: isLoadingStakedBalance } =
      useStakedBalance({
        stakingPoolId,
        accountId: lockupAccountId,
      });

    const {
      unstakedBalance,
      isLoading: isLoadingUnstakedBalance,
      isAvailable: isUnstakedBalanceAvailable,
    } = useUnstakedBalance({
      stakingPoolId,
      accountId: lockupAccountId,
    });

    const { withdrawNear, isWithdrawingNear, deleteLockup, isDeletingLockup } =
      useStakeNear({
        lockupAccountId: lockupAccountId ?? "",
      });

    const filteredLiquidLockupBalance = useMemo(() => {
      return {
        withdrawableNearBalance: filterDust({
          amount: liquidLockupBalance.withdrawableNearBalance ?? "0",
        }),
        stakableNearBalance: filterDust({
          amount: liquidLockupBalance.stakableNearBalance ?? "0",
        }),
        lockableNearBalance: filterDust({
          amount: liquidLockupBalance.lockableNearBalance ?? "0",
        }),
      };
    }, [
      liquidLockupBalance.lockableNearBalance,
      liquidLockupBalance.stakableNearBalance,
      liquidLockupBalance.withdrawableNearBalance,
    ]);

    const hasLiquidNearInLockup = useMemo(
      () =>
        Big(filteredLiquidLockupBalance.lockableNearBalance ?? "0").gt(0) ||
        Big(filteredLiquidLockupBalance.stakableNearBalance ?? "0").gt(0) ||
        Big(filteredLiquidLockupBalance.withdrawableNearBalance ?? "0").gt(0),
      [
        filteredLiquidLockupBalance.lockableNearBalance,
        filteredLiquidLockupBalance.stakableNearBalance,
      ]
    );

    const showDeleteLockup = useMemo(() => {
      const staked = Big(stakedBalance ?? "0");
      const unstaked = Big(unstakedBalance ?? "0");
      const pending = Big(pendingBalance ?? "0");

      const totalBalance = Big(accountInfo?.totalBalance.near ?? "0");
      const MAX_REMAINING_FOR_DELETE = Big("2.1").mul(Big(10).pow(24));

      return (
        staked.eq(0) &&
        unstaked.eq(0) &&
        pending.eq(0) &&
        totalBalance.lte(MAX_REMAINING_FOR_DELETE) &&
        !!lockupAccountId
      );
    }, [
      stakedBalance,
      unstakedBalance,
      pendingBalance,
      accountInfo?.totalBalance.near,
      lockupAccountId,
    ]);

    const isLoading =
      isLoadingLockupAccountId ||
      isLoadingStakingPoolId ||
      isLoadingAccountInfo ||
      isLoadingLockupPendingBalance ||
      isLoadingStakedBalance ||
      isLoadingUnstakedBalance ||
      isLoadingLiquidLockupBalance;

    if (isLoading) {
      return (
        <>
          <tr>
            <td colSpan={3} className="pb-3">
              <h3 className="text-lg font-semibold">Lockup Holdings</h3>
            </td>
          </tr>
          <tr>
            <td colSpan={3}>
              <Skeleton className="h-14 w-full mb-2" />
            </td>
          </tr>
          <tr>
            <td colSpan={3}>
              <Skeleton className="h-14 w-full mb-2" />
            </td>
          </tr>
          <tr>
            <td colSpan={3}>
              <Skeleton className="h-14 w-full" />
            </td>
          </tr>
        </>
      );
    }

    return (
      <>
        <tr>
          <td colSpan={3} className="pb-3">
            <h3 className="text-lg font-semibold">Lockup Holdings</h3>
          </td>
        </tr>
        <VeNearAssetRow
          unlockTimestamp={unlockTimestamp ?? undefined}
          lockupAccountId={lockupAccountId ?? undefined}
          balanceWithRewards={balanceWithRewards}
          hasPendingBalance={hasPendingBalance}
          pendingBalance={pendingBalance}
          isEligibleToUnlock={isEligibleToUnlock}
        />
        {hasLiquidNearInLockup && (
          <LockupLiquidNearRow
            liquidLockupBalance={filteredLiquidLockupBalance}
            onStakeClick={openStakingDialog}
            onLockClick={openLockDialog}
            lockupAccountId={lockupAccountId}
          />
        )}
        {stakingPoolId && (
          <>
            {Big(filterDust({ amount: stakedBalance ?? "0" })).gt(0) && (
              <VeNearStakedAssetRow
                stakingPoolId={stakingPoolId}
                stakedBalance={stakedBalance ?? "0"}
                onUnstakeClick={openUnstakeDialog}
              />
            )}
            {Big(filterDust({ amount: unstakedBalance ?? "0" })).gt(0) && (
              <VeNearStakedAssetRow
                stakingPoolId={stakingPoolId}
                stakedBalance={unstakedBalance ?? "0"}
                onUnstakeClick={async () => {
                  if (unstakedBalance) {
                    try {
                      await withdrawNear(unstakedBalance);
                      toast.success("Withdraw complete");
                    } catch (e: any) {
                      if (
                        e?.message?.includes("User rejected") ||
                        e?.message?.includes("user rejected")
                      ) {
                        return;
                      }
                      toast.error("Failed to withdraw");
                    }
                  }
                }}
                overrideTitle={
                  isUnstakedBalanceAvailable
                    ? "Available to withdraw"
                    : "Pending Release"
                }
                hideUnstakeButton={!isUnstakedBalanceAvailable}
                releaseTimeLabel={
                  isUnstakedBalanceAvailable ? "Now" : "~52-65 hours"
                }
                overrideUnstakeLabel="Withdraw"
                isLoading={isWithdrawingNear}
              />
            )}
          </>
        )}
        {showDeleteLockup && (
          <ResponsiveAssetRow
            metadata={{
              ...NEAR_TOKEN_METADATA,
              name: "Storage Deposit",
            }}
            icon={
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <TrashIcon className="w-5 h-5 text-red-600" />
              </div>
            }
            columns={[
              {
                title: "Refundable Amount",
                subtitle: (
                  <span className="text-sm font-medium">Reclaim Storage</span>
                ),
              },
            ]}
            actionButtons={[
              {
                title: "Close Account",
                onClick: async () => {
                  try {
                    await deleteLockup();
                    toast.success("Account closed and storage reclaimed");
                  } catch (e: any) {
                    if (
                      e?.message?.includes("User rejected") ||
                      e?.message?.includes("user rejected")
                    ) {
                      return;
                    }
                    toast.error("Failed to close account");
                  }
                },
                isLoading: isDeletingLockup,
              },
            ]}
          />
        )}
      </>
    );
  }
);

LockupHoldings.displayName = "LockupHoldings";
