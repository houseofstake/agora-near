"use client";

import { useNear } from "@/contexts/NearContext";
import { useVenearAccountInfo } from "@/hooks/useVenearAccountInfo";
import { useVenearConfig } from "@/hooks/useVenearConfig";
import { MIN_VERSION_FOR_LST_LOCKUP } from "@/lib/constants";
import { memo, useMemo } from "react";
import { LiquidStakingTokenLockWarning } from "../Dialogs/LockDialog/LiquidStakingTokenLockWarning";
import AgoraLoader from "../shared/AgoraLoader/AgoraLoader";
import { AssetsLandingPage } from "./AssetsLandingPage";
import { GovernanceRewardsCard } from "./GovernanceRewardsCard";
import { HoldingsSection } from "./HoldingsSection";
import { VotingPowerCard } from "./VotingPowerCard";
import { DelegationSummaryCard } from "./DelegationSummaryCard";

export const AssetsHome = memo(() => {
  const { signedAccountId } = useNear();
  const { data: accountInfo, isLoading: isLoadingAccount } =
    useVenearAccountInfo(signedAccountId);

  const { lockupVersion, isLoading: isLoadingVenearConfig } = useVenearConfig({
    enabled: true,
  });

  const shouldShowLSTWarning = useMemo(() => {
    // Only show warning when user is connected
    if (!signedAccountId) return false;

    // Your lockup version takes precedence if you have onboarded, otherwise use global lockup version
    const lockupVersionToCheck = accountInfo?.lockupVersion ?? lockupVersion;

    return lockupVersionToCheck < MIN_VERSION_FOR_LST_LOCKUP;
  }, [signedAccountId, accountInfo, lockupVersion]);

  if (isLoadingAccount || isLoadingVenearConfig) {
    return (
      <div className="flex flex-col w-full h-full justify-center items-center">
        <AgoraLoader />
      </div>
    );
  }

  if (!accountInfo) {
    return (
      <div className="flex flex-col w-full min-h-screen">
        <AssetsLandingPage shouldShowLSTWarning={shouldShowLSTWarning} />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      {shouldShowLSTWarning && (
        <div className="w-full bg-[#F9F8F7] border-b border-gray-200 px-4 py-3 mt-4 rounded-2xl">
          <div className="mx-auto">
            <LiquidStakingTokenLockWarning />
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-6 sm:px-6 py-6">
        <div className="w-full sm:w-[70%] flex">
          <VotingPowerCard />
        </div>
        <div className="w-full sm:w-[30%] flex">
          <GovernanceRewardsCard />
        </div>
      </div>
      <div className="flex flex-col sm:px-6 -mt-2 mb-4">
        <DelegationSummaryCard />
      </div>
      <HoldingsSection />
    </div>
  );
});

AssetsHome.displayName = "AssetsHome";
