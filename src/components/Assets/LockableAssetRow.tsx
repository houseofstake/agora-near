import { memo, useCallback, useMemo } from "react";
import {
  LINEAR_TOKEN_CONTRACT,
  STNEAR_TOKEN_CONTRACT,
  RNEAR_TOKEN_CONTRACT,
} from "@/lib/constants";
import { TokenWithBalance } from "@/lib/types";
import TokenAmount from "../shared/TokenAmount";
import { ResponsiveAssetRow } from "./ResponsiveAssetRow";

interface LockableAssetRowProps {
  token: TokenWithBalance;
  stakingPoolId?: string | null;
  onLockClick: (tokenAccountId?: string) => void;
}

export const LockableAssetRow = memo<LockableAssetRowProps>(
  ({ token, stakingPoolId, onLockClick }) => {
    const handleManageStaking = useCallback((tokenAccountId: string) => {
      let url = "";

      // Determine the correct URL based on the token
      if (tokenAccountId === LINEAR_TOKEN_CONTRACT) {
        url = "https://app.linearprotocol.org/";
      } else if (tokenAccountId === STNEAR_TOKEN_CONTRACT) {
        url = "https://www.metapool.app/stake/?token=near";
      } else if (tokenAccountId === RNEAR_TOKEN_CONTRACT) {
        url = "https://app.rhea.finance/stake";
      }

      if (url) {
        window.open(url, "_blank");
      }
    }, []);

    const handleLockClick = useCallback(
      (tokenAccountId?: string) => {
        onLockClick(tokenAccountId);
      },
      [onLockClick]
    );

    const overflowButtons = useMemo(() => {
      const buttons = [];

      // Add "Manage staking" button for LST tokens
      if (token.type === "lst") {
        buttons.push({
          title: "Manage staking",
          onClick: () => handleManageStaking(token.accountId ?? ""),
          showExternalIcon: true,
        });
      }

      return buttons;
    }, [token.type, token.accountId, handleManageStaking]);

    const actionButton = useMemo(
      () => ({
        title: token.type === "lst" ? "Lock" : "Lock & Stake",
        onClick: () => handleLockClick(token.accountId),
        disabled:
          !!stakingPoolId &&
          token.type === "lst" &&
          stakingPoolId !== token.accountId,
        tooltip:
          !!stakingPoolId &&
          token.type === "lst" &&
          stakingPoolId !== token.accountId
            ? "Token uses a different staking pool. Unstake current pool first to switch."
            : undefined,
      }),
      [token.type, token.accountId, stakingPoolId, handleLockClick]
    );

    const columns = useMemo(
      () => [
        {
          title: "Lockable",
          subtitle: (
            <TokenAmount
              amount={token.balance}
              currency={token.metadata?.symbol}
              maximumSignificantDigits={4}
              minimumFractionDigits={4}
            />
          ),
        },
      ],
      [token.balance, token.metadata?.symbol]
    );

    return (
      <ResponsiveAssetRow
        metadata={token.metadata}
        columns={columns}
        showOverflowMenu
        overflowButtons={overflowButtons}
        actionButton={actionButton}
      />
    );
  }
);

LockableAssetRow.displayName = "AvailableTokenRow";
