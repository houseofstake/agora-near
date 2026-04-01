import { useLiquidWalletTokens } from "@/hooks/useAvailableTokens";
import { useCurrentStakingPoolId } from "@/hooks/useCurrentStakingPoolId";
import { useLockupAccount } from "@/hooks/useLockupAccount";
import { filterDust, removeDeposit } from "@/lib/tokenUtils";
import { memo, useMemo } from "react";
import { Skeleton } from "../ui/skeleton";
import { LockableAssetRow } from "./LockableAssetRow";

interface WalletHoldingsProps {
  openLockDialog: (preSelectedTokenId?: string | null) => void;
}

export const WalletHoldings = memo(
  ({ openLockDialog }: WalletHoldingsProps) => {
    const {
      isLoading: isLoadingLiquidWalletTokens,
      availableTokens: liquidWalletTokens,
    } = useLiquidWalletTokens();

    const { lockupAccountId, isLoading: isLoadingLockupAccountId } =
      useLockupAccount();

    const { stakingPoolId, isLoadingStakingPoolId } = useCurrentStakingPoolId({
      lockupAccountId,
    });

    const walletTokens = useMemo(
      () => liquidWalletTokens.filter((token) => token.type !== "lockup"),
      [liquidWalletTokens]
    );

    // TODO: Fix root cause of dust amounts remaining after "Max" lock
    const filteredWalletTokens = useMemo(
      () =>
        walletTokens.map((token) => ({
          ...token,
          balance:
            token.type === "near"
              ? removeDeposit({
                  amount: filterDust({ amount: token.balance }),
                })
              : filterDust({ amount: token.balance }),
        })),
      [walletTokens]
    );

    const isLoading =
      isLoadingLiquidWalletTokens ||
      isLoadingLockupAccountId ||
      isLoadingStakingPoolId;

    if (isLoading) {
      return (
        <>
          <tr>
            <td colSpan={3} className="pt-8 pb-3">
              <h3 className="text-lg font-semibold">Wallet Holdings</h3>
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
          <td colSpan={3} className="pt-8 pb-3">
            <h3 className="text-lg font-semibold">Wallet Holdings</h3>
          </td>
        </tr>
        {filteredWalletTokens.map((token) => (
          <LockableAssetRow
            key={token.accountId}
            token={token}
            stakingPoolId={stakingPoolId ?? undefined}
            onLockClick={openLockDialog}
          />
        ))}
      </>
    );
  }
);

WalletHoldings.displayName = "WalletHoldings";
