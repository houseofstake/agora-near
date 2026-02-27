"use client";

import CopyableHumanAddress from "../../shared/CopyableHumanAddress";
import { useNearSocialProfile } from "@/hooks/useNearSocialProfile";

interface Props {
  address: string;
  shouldTruncate?: boolean;
  displayName?: string | null;
  fetchDisplayName?: boolean;
  inlineDisplay?: boolean;
}

export function DelegateAddress({
  address,
  shouldTruncate = true,
  displayName,
  fetchDisplayName = true,
  inlineDisplay = false,
}: Props) {
  const { data: nearSocialProfile } = useNearSocialProfile(
    fetchDisplayName && !displayName ? address : undefined
  );
  const resolvedDisplayName = displayName ?? nearSocialProfile?.name;

  return (
    <div className="flex flex-row gap-4 items-center">
      <div
        className={
          inlineDisplay ? "flex flex-row items-baseline gap-2" : "flex flex-col"
        }
      >
        {resolvedDisplayName && (
          <div className="text-primary font-semibold leading-tight">
            {resolvedDisplayName}
          </div>
        )}
        <div className="text-secondary flex flex-row gap-1 font-semibold hover:opacity-90">
          {inlineDisplay && resolvedDisplayName && <span>(</span>}
          <CopyableHumanAddress
            address={address}
            shouldTruncate={shouldTruncate}
          />
          {inlineDisplay && resolvedDisplayName && <span>)</span>}
        </div>
      </div>
    </div>
  );
}
