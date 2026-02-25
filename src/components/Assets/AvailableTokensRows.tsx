import { memo, useCallback } from "react";
import { LINEAR_TOKEN_CONTRACT, STNEAR_TOKEN_CONTRACT } from "@/lib/constants";
import { TokenWithBalance } from "@/lib/types";
import TokenAmount from "../shared/TokenAmount";
import { AssetRow } from "./AssetRow";

interface AvailableTokenRowProps {
  token: TokenWithBalance;
  stakingPoolId?: string;
  onLockDialog: (tokenAccountId?: string) => void;
}

export const AvailableTokenRow = memo<AvailableTokenRowProps>(
  ({ token, stakingPoolId, onLockDialog }) => {
    const handleManageStaking = useCallback((tokenAccountId: string) => {
      let url = "";

      // Determine the correct URL based on the token
      if (tokenAccountId === LINEAR_TOKEN_CONTRACT) {
        url = "https://app.linearprotocol.org/";
      } else if (tokenAccountId === STNEAR_TOKEN_CONTRACT) {
        url = "https://www.metapool.app/stake/?token=near";
      }

      if (url) {
        window.open(url, "_blank");
      }
    }, []);

    const handleLockDialog = useCallback(
      (tokenAccountId?: string) => {
        onLockDialog(tokenAccountId);
      },
      [onLockDialog]
    );

    const overflowButtons = [];

    // Add "Manage staking" button for LST tokens
    if (token.type === "lst") {
      overflowButtons.push({
        title: "Manage staking",
        onClick: () => handleManageStaking(token.accountId ?? ""),
        showExternalIcon: true,
      });
    }

    return (
      <AssetRow
        metadata={token.metadata}
        columns={[
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
        ]}
        showOverflowMenu
        overflowButtons={overflowButtons}
        actionButton={{
          title: token.type === "lst" ? "Lock" : "Lock & Stake",
          onClick: () => handleLockDialog(token.accountId),
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
        }}
      />
    );
  }
);

AvailableTokenRow.displayName = "AvailableTokenRow";
