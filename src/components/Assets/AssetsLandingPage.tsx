"use client";

import { useNear } from "@/contexts/NearContext";
import { useStakingPoolStats } from "@/hooks/useStakingPoolStats";
import { useVenearAccountInfo } from "@/hooks/useVenearAccountInfo";
import { useVenearSnapshot } from "@/hooks/useVenearSnapshot";
import { LINEAR_POOL, STNEAR_POOL } from "@/lib/constants";
import { getAPYFromGrowthRate } from "@/lib/lockUtils";
import Big from "big.js";
import { memo, useCallback, useMemo } from "react";
import { UpdatedButton } from "../Button";
import { useOpenDialog } from "../Dialogs/DialogProvider/DialogProvider";
import { LiquidStakingTokenLockWarning } from "../Dialogs/LockDialog/LiquidStakingTokenLockWarning";
import AgoraLoader from "../shared/AgoraLoader/AgoraLoader";
import { ProjectionSlider } from "../shared/ProjectionSlider";
import { LockTokensCard } from "./LockTokensCard";
import { StakingRewardsCard } from "./StakingRewardsCard";

const DEFAULT_BALANCE_FOR_PROJECTION = 10000;

export const AssetsLandingPage = memo(
  ({ shouldShowLSTWarning }: { shouldShowLSTWarning: boolean }) => {
    const openDialog = useOpenDialog();
    const { signedAccountId, signIn } = useNear();
    const { data: accountInfo, isLoading: isLoadingAccount } =
      useVenearAccountInfo(signedAccountId);

    const { growthRateNs, isLoading: isLoadingVenearSnapshot } =
      useVenearSnapshot();

    const lockApy = useMemo(
      () => getAPYFromGrowthRate(growthRateNs),
      [growthRateNs]
    );

    const { stats, isLoading: isLoadingStakingPoolStats } = useStakingPoolStats(
      {
        pools: [LINEAR_POOL, STNEAR_POOL],
      }
    );

    const maxStakingApy = useMemo(() => {
      const maxApy = Object.values(stats).reduce((max, current) => {
        return Math.max(max, current.apy);
      }, 0);

      return Big(maxApy * 100).toFixed(2);
    }, [stats]);

    const handleStakeAndLock = useCallback(() => {
      if (!signedAccountId) {
        signIn();
        return;
      }

      openDialog({
        type: "NEAR_LOCK",
        params: {
          source: accountInfo ? "account_management" : "onboarding",
        },
      });
    }, [signedAccountId, openDialog, accountInfo, signIn]);

    const handleProjectionChange = useCallback(
      (projection: { amount: number; years: number }) => {
        console.log("Projection changed:", projection);
      },
      []
    );

    if (isLoadingAccount || isLoadingVenearSnapshot) {
      return (
        <div className="flex flex-col w-full h-full justify-center items-center">
          <AgoraLoader />
        </div>
      );
    }

    return (
      <div className="w-full min-h-screen relative">
        {shouldShowLSTWarning && (
          <div className="w-full bg-wash border-b border-line rounded-2xl px-4 py-3 mt-4">
            <div className="max-w-6xl mx-auto">
              <LiquidStakingTokenLockWarning />
            </div>
          </div>
        )}
        <div className="flex flex-col gap-8 lg:gap-16 mt-6 lg:mt-12">
          <div className="grid relative mx-auto py-8 lg:py-16">
            <div className="absolute inset-0 overflow-hidden p-4">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(20, 1fr)",
                  gap: "2rem",
                }}
              >
                {Array.from({ length: 700 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 text-primary dark:opacity-20 flex items-center justify-center"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="12"
                      height="12"
                      fill="currentColor"
                    >
                      <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-8 items-center px-4 lg:px-0">
              <div className="text-center lg:text-left order-1 lg:order-1 z-10 bg-neutral dark:bg-black py-6 lg:py-8 lg:ml-10">
                <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-5xl font-bold text-primary mb-4 lg:mb-6 leading-tight">
                  Lock & stake tokens for boosted voting power & veNEAR rewards
                </h1>
                <UpdatedButton
                  type="primary"
                  variant="rounded"
                  onClick={handleStakeAndLock}
                  className="px-6 lg:px-8 py-3 text-base lg:text-lg font-semibold !bg-[#00E391] !text-primary dark:!text-black rounded-lg"
                >
                  Lock & Stake
                </UpdatedButton>
              </div>

              <div className="flex flex-row gap-2 lg:gap-6 order-2 lg:order-2 justify-center lg:justify-start mx-auto lg:mx-0">
                <div className="w-[160px] sm:w-[200px] lg:w-[300px] sm:h-[320px] lg:h-[400px] lg:mb-4">
                  <LockTokensCard apy={lockApy} />
                </div>
                <div className="w-[160px] sm:w-[200px] lg:w-[300px] sm:h-[320px] lg:h-[400px] lg:mt-4 flex grow">
                  <StakingRewardsCard
                    apy={maxStakingApy}
                    isLoadingApy={isLoadingStakingPoolStats}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 lg:mb-16 px-4 lg:px-0">
            <ProjectionSlider
              apy={Number(lockApy) / 100}
              startingAmount={DEFAULT_BALANCE_FOR_PROJECTION}
              onProjectionChange={handleProjectionChange}
            />
          </div>
          <div className="mb-8 lg:mb-16 px-4 lg:px-0">
            <p className="text-sm sm:text-base lg:text-sm text-tertiary mb-2">
              *Source of APY comes from non-liquid staking pools and is subject
              to change. For up to date APY, please refer to the staking pools
              directly.
            </p>
            <p className="text-sm sm:text-base lg:text-sm text-tertiary">
              **Rewards and any annualized equivalents are variable, not
              guaranteed, and may change based on program parameters and
              participation. Locking may reduce liquidity.
            </p>
          </div>
        </div>
      </div>
    );
  }
);

AssetsLandingPage.displayName = "AssetsLandingPage";
