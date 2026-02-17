"use client";

import CopyableHumanAddress from "../../shared/CopyableHumanAddress";
import { useNearSocialProfile } from "@/hooks/useNearSocialProfile";

interface Props {
  address: string;
  shouldTruncate?: boolean;
  displayName?: string | null;
  fetchDisplayName?: boolean;
}

export function DelegateAddress({
  address,
  shouldTruncate = true,
  displayName,
  fetchDisplayName = true,
}: Props) {
  const { data: nearSocialProfile } = useNearSocialProfile(
    fetchDisplayName && !displayName ? address : undefined
  );
  const resolvedDisplayName = displayName ?? nearSocialProfile?.name;

  return (
    <div className="flex flex-row gap-4 items-center">
      <div className="flex flex-col">
        {resolvedDisplayName && (
          <div className="text-primary font-semibold leading-tight">
            {resolvedDisplayName}
          </div>
        )}
        <div className="text-secondary flex flex-row gap-1 font-semibold hover:opacity-90">
          <CopyableHumanAddress
            address={address}
            shouldTruncate={shouldTruncate}
          />
        </div>
      </div>
    </div>
  );
}
