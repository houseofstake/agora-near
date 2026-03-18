import { useMemo } from "react";
import { ResponsiveAssetRow } from "./ResponsiveAssetRow";
import TokenAmount from "../shared/TokenAmount";
import { LINEAR_POOL, STNEAR_POOL, RNEAR_POOL } from "@/lib/constants";
import nearAssetIcon from "@/assets/near_icon.jpg";
import Big from "big.js";

export const VeNearStakedAssetRow = ({
  stakedBalance,
  stakingPoolId,
  onUnstakeClick,
  overrideTitle,
  hideUnstakeButton,
  releaseTimeLabel,
  overrideUnstakeLabel,
  isLoading,
}: {
  stakedBalance: string;
  stakingPoolId: string;
  onUnstakeClick: () => void;
  overrideTitle?: string;
  hideUnstakeButton?: boolean;
  releaseTimeLabel?: string;
  overrideUnstakeLabel?: string;
  isLoading?: boolean;
}) => {
  const token = useMemo(() => {
    if (stakingPoolId === LINEAR_POOL.contract) {
      return LINEAR_POOL.metadata;
    }

    if (stakingPoolId === STNEAR_POOL.contract) {
      return STNEAR_POOL.metadata;
    }

    if (stakingPoolId === RNEAR_POOL.contract) {
      return RNEAR_POOL.metadata;
    }

    // Fallback for custom staking pools
    return {
      name: stakingPoolId,
      symbol: "NEAR",
      icon: nearAssetIcon,
      decimals: 24,
      isCustomPool: true,
    };
  }, [stakingPoolId]);

  const columns = useMemo(
    () => [
      {
        title: overrideTitle ?? "Staked balance",
        subtitle: (
          <TokenAmount
            amount={stakedBalance}
            maximumSignificantDigits={4}
            minimumFractionDigits={4}
            showDustTooltip={true}
          />
        ),
      },
      ...(releaseTimeLabel
        ? [
            {
              title: "Est. Release",
              subtitle: <span>{releaseTimeLabel}</span>,
            },
          ]
        : []),
    ],
    [stakedBalance, overrideTitle, releaseTimeLabel]
  );

  const actionButtons = useMemo(() => {
    if (hideUnstakeButton) return [];
    return [
      {
        title: overrideUnstakeLabel ?? "Unstake",
        onClick: onUnstakeClick,
        isLoading: isLoading,
        disabled: Big(stakedBalance ?? 0).lte(0),
      },
    ];
  }, [
    onUnstakeClick,
    hideUnstakeButton,
    overrideUnstakeLabel,
    isLoading,
    stakedBalance,
  ]);

  return (
    <ResponsiveAssetRow
      metadata={token}
      columns={columns}
      showOverflowMenu={false}
      actionButtons={actionButtons}
    />
  );
};
