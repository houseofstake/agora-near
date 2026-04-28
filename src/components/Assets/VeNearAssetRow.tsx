import { useCompleteUnlock } from "@/hooks/useCompleteUnlock";
import { VENEAR_TOKEN_METADATA } from "@/lib/constants";
import { getFormattedUnlockTimestamp } from "@/lib/lockUtils";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { memo, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { useOpenDialog } from "../Dialogs/DialogProvider/DialogProvider";
import TokenAmount from "../shared/TokenAmount";
import { TooltipWithTap } from "../ui/tooltip-with-tap";
import { ResponsiveAssetRow } from "./ResponsiveAssetRow";

interface VeNearAssetRowProps {
  balanceWithRewards: string;
  hasPendingBalance: boolean;
  pendingBalance: string | undefined;
  isEligibleToUnlock: boolean | undefined;
  lockupAccountId?: string;
  unlockTimestamp?: string;
}

export const VeNearAssetRow = memo<VeNearAssetRowProps>(
  ({
    balanceWithRewards,
    hasPendingBalance,
    pendingBalance,
    isEligibleToUnlock,
    lockupAccountId,
    unlockTimestamp,
  }) => {
    const openDialog = useOpenDialog();

    const { completeUnlock } = useCompleteUnlock({
      lockupAccountId: lockupAccountId ?? "",
      onSuccess: () => toast.success("Unlock complete"),
    });

    const handleUnlockTokens = useCallback(() => {
      if (isEligibleToUnlock && hasPendingBalance) {
        completeUnlock({ amount: pendingBalance });
        return;
      }

      openDialog({
        type: "NEAR_UNLOCK",
        params: {},
      });
    }, [
      openDialog,
      isEligibleToUnlock,
      hasPendingBalance,
      completeUnlock,
      pendingBalance,
    ]);

    const pendingBalanceCol = useMemo(() => {
      if (!hasPendingBalance) return null;

      return {
        title: (
          <>
            <div className="flex flex-row items-center gap-2">
              <span>
                {isEligibleToUnlock ? "Ready for unlock" : "Pending unlock"}
              </span>
              {unlockTimestamp && !isEligibleToUnlock && (
                <TooltipWithTap
                  content={
                    <div className="max-w-[300px]">
                      <p>
                        Funds can be unlocked after{" "}
                        <span className="font-bold">
                          {getFormattedUnlockTimestamp(unlockTimestamp)}
                        </span>
                      </p>
                    </div>
                  }
                >
                  <InformationCircleIcon className="w-4 h-4" />
                </TooltipWithTap>
              )}
            </div>
          </>
        ),
        subtitle: (
          <TokenAmount
            amount={pendingBalance ?? "0"}
            maximumSignificantDigits={4}
            minimumFractionDigits={4}
            showDustTooltip={true}
          />
        ),
      };
    }, [
      hasPendingBalance,
      isEligibleToUnlock,
      pendingBalance,
      unlockTimestamp,
    ]);

    const columns = useMemo(() => {
      const lockedAmount = (
        <TokenAmount
          amount={balanceWithRewards}
          maximumSignificantDigits={4}
          minimumFractionDigits={4}
          showDustTooltip={true}
        />
      );

      return [
        {
          title: "Locked",
          subtitle: lockedAmount,
        },
        ...(pendingBalanceCol ? [pendingBalanceCol] : []),
      ];
    }, [balanceWithRewards, pendingBalanceCol]);

    const actionButton = useMemo(() => {
      const canWithdraw = isEligibleToUnlock && hasPendingBalance;
      const canUnlock = Number(balanceWithRewards) > 0;

      if (!canWithdraw && !canUnlock) {
        if (hasPendingBalance) {
          return {
            title: "Withdraw",
            onClick: () => {},
            disabled: true,
            tooltip: "Wait for the unlock period to finish",
          };
        }
        return undefined;
      }

      return {
        title: canWithdraw ? "Withdraw" : "Unlock",
        onClick: handleUnlockTokens,
      };
    }, [
      handleUnlockTokens,
      isEligibleToUnlock,
      hasPendingBalance,
      balanceWithRewards,
    ]);

    return (
      <ResponsiveAssetRow
        metadata={VENEAR_TOKEN_METADATA}
        columns={columns}
        showOverflowMenu={false}
        actionButton={actionButton}
      />
    );
  }
);

VeNearAssetRow.displayName = "VeNearAssetRow";
