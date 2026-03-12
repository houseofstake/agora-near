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
import Big from "big.js";

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
      const isDustAndGreaterThanZero =
        Big(balanceWithRewards).gt(0) &&
        Big(balanceWithRewards).lt(Big(10).pow(20)); // less than 0.0001 NEAR

      const lockedAmount = (
        <TokenAmount
          amount={balanceWithRewards}
          maximumSignificantDigits={4}
          minimumFractionDigits={4}
        />
      );

      return [
        {
          title: "Locked",
          subtitle: isDustAndGreaterThanZero ? (
            <TooltipWithTap
              content={
                <div className="flex flex-col text-center p-2">
                  <p className="font-semibold text-sm">Dust Amount</p>
                  <p className="font-mono text-xs">{balanceWithRewards} yoctoNEAR</p>
                </div>
              }
            >
              <span className="cursor-pointer">
                ~0 NEAR
              </span>
            </TooltipWithTap>
          ) : (
            lockedAmount
          ),
        },
        ...(pendingBalanceCol ? [pendingBalanceCol] : []),
      ];
    }, [balanceWithRewards, pendingBalanceCol]);

    const actionButton = useMemo(
      () => ({
        title: "Unlock",
        onClick: handleUnlockTokens,
      }),
      [handleUnlockTokens]
    );

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
