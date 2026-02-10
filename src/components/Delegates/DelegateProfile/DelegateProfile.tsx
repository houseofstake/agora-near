import { DelegateCardHeader } from "@/components/Delegates/DelegateCard/DelegateCardHeader";
import TokenAmount from "@/components/shared/TokenAmount";
import React from "react";
import { DelegateActions } from "./DelegateActions";
import { DelegateAddress } from "../DelegateCard/DelegateAddress";
import { DelegateCardEditProfile } from "../DelegateCard/DelegateCardEditProfile";
import { EndorsedTooltip } from "../DelegateCardList/EndorsedTooltip";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useEffect, useRef } from "react";

type DelegateProfileProps = {
  profile: {
    address: string;
    twitter?: string | null;
    discord?: string | null;
    email?: string | null;
    warpcast?: string | null;
    topIssues?:
      | {
          type: string;
          value: string;
        }[]
      | null;
    statement?: string | null;
    endorsed?: boolean | null;
    votingPower?: string | null;
  };
  isEditMode?: boolean;
  stats?: {
    votingPower?: string | null;
    numOfDelegators?: string | null;
    proposalsCreated?: string | null;
    votedFor?: string | null;
    votedAgainst?: string | null;
    votedAbstain?: string | null;
    participationRate?: string | null;
  };
};

export default function DelegateProfile({
  profile,
  isEditMode,
  stats,
}: DelegateProfileProps) {
  const { trackDelegateProfileViewed } = useAnalytics();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current) {
      hasTracked.current = true;
      trackDelegateProfileViewed({
        delegate_address: profile.address,
        delegate_name: profile.address, // We don't have a separate name field here usually, it's the address
        delegate_voting_power: stats?.votingPower ?? "0",
      });
    }
  }, [profile.address, stats?.votingPower, trackDelegateProfileViewed]);

  return (
    <div className="flex flex-col static sm:sticky top-16 flex-shrink-0 width-[20rem]">
      {stats?.participationRate && (
        <DelegateCardHeader participationRate={stats?.participationRate} />
      )}
      <div className="flex flex-col bg-wash border border-line shadow-newDefault rounded-xl">
        <div className="flex flex-col items-stretch p-7">
          <div className="flex flex-row items-center gap-2">
            <DelegateAddress address={profile.address} shouldTruncate={true} />
            {profile.endorsed && <EndorsedTooltip />}
          </div>
        </div>
        {!isEditMode && (
          <div className="flex flex-col p-7 border-t border-line">
            <div className="flex flex-col gap-4">
              <PanelRow
                title="Voting power"
                detail={
                  <TokenAmount
                    amount={stats?.votingPower ?? "0"}
                    currency="veNEAR"
                  />
                }
              />
              <PanelRow
                title="Delegated addresses"
                detail={stats?.numOfDelegators ?? "0"}
              />
              <PanelRow
                title="Proposals created"
                detail={stats?.proposalsCreated ?? "0"}
              />
              <PanelRow
                title="For/Against"
                detail={
                  <div className="flex flex-row gap-2">
                    <span className="text-positive font-bold border border-line rounded-md px-2 py-1">
                      {stats?.votedFor ?? "0"}
                    </span>
                    <span className="text-negative font-bold border border-line rounded-md px-2 py-1">
                      {stats?.votedAgainst ?? "0"}
                    </span>
                    <span className="text-tertiary font-bold border border-line rounded-md px-2 py-1">
                      {stats?.votedAbstain ?? "0"}
                    </span>
                  </div>
                }
              />
              <DelegateActions
                address={profile.address}
                twitter={profile.twitter}
                discord={profile.discord}
                warpcast={profile.warpcast}
                votingPower={profile.votingPower}
              />
            </div>
          </div>
        )}
        <DelegateCardEditProfile delegateAddress={profile.address} />
      </div>
    </div>
  );
}

export const PanelRow = ({
  title,
  detail,
  className,
}: {
  title: string;
  detail: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`flex flex-row gap-2 justify-between items-center ${className}`}
    >
      <span className="whitespace-nowrap text-secondary">{title}</span>
      <span className="text-right text-secondary font-bold">{detail}</span>
    </div>
  );
};

export const DelegateCardSkeleton = () => {
  return (
    <div className="flex flex-col static sm:sticky top-16 flex-shrink-0 width-[20rem] h-[300px] bg-tertiary/10 animate-pulse rounded-lg"></div>
  );
};
