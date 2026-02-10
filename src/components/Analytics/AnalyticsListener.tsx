"use client";

import { useEffect, useRef } from "react";
import { useNear } from "@/contexts/NearContext";
import { useVenearAccountStats } from "@/hooks/useVenearAccountStats";
import { useDelegateProfile } from "@/hooks/useDelegateProfile";
import { identifyUser } from "@/lib/analytics";

/**
 * AnalyticsListener Component
 *
 * This component acts as a headless data synchronizer for analytics.
 * Its primary purpose is to enrich the user's analytics profile with on-chain data
 * that is not available at the initial wallet connection moment.
 *
 * Lifecycle:
 * 1. Mounts when the app loads (via Web3Provider).
 * 2. Observes `signedAccountId` changes.
 * 3. Fetches:
 *    - veNEAR balance, lockup stats, and ownership (`useVenearAccountStats`)
 *    - Delegate profile and comprehensive voting history (`useDelegateProfile`)
 * 4. Once all data is loaded and stable, calls `identifyUser` to update Mixpanel/GA4 people properties.
 * 5. Resets its internal tracking state if the user switches accounts.
 *
 * @returns null - This component renders no UI elements.
 */
export function AnalyticsListener() {
  const { signedAccountId } = useNear();
  const hasIdentified = useRef(false);

  // 1. Fetch veNEAR and Lockup stats (balances, owner balance, etc.)
  const { data: stats, isLoading: isStatsLoading } =
    useVenearAccountStats(signedAccountId);

  // 2. Fetch Delegate Profile (verifies delegate status and retrieves voting history)
  const { data: delegateProfile, isLoading: isDelegateLoading } =
    useDelegateProfile({
      accountId: signedAccountId,
    });

  useEffect(() => {
    // Only proceed if we have a valid session ID and all async data has loaded.
    // The check `delegateProfile !== undefined` ensures the query has completed,
    // as it can return null (not a delegate) but we need to know it's not still loading/undefined.
    if (
      signedAccountId &&
      !isStatsLoading &&
      stats &&
      !isDelegateLoading &&
      delegateProfile !== undefined &&
      !hasIdentified.current
    ) {
      // Determine if the user is an active delegate based on statement existence
      const isDelegate = !!(
        delegateProfile &&
        delegateProfile.statement &&
        delegateProfile.statement.length > 0
      );

      // Aggregate voting activity from the delegate profile's history
      const totalVotes =
        (delegateProfile?.forCount || 0) +
        (delegateProfile?.againstCount || 0) +
        (delegateProfile?.abstainCount || 0);

      const hasVoted = totalVotes > 0;

      // Determine lockup count (currently binary: 1 if exists, 0 if not)
      const lockupCount = stats.lockupAccountId ? 1 : 0;

      // Compile user properties for analytics identification
      const userProperties = {
        total_near_locked_yocto: stats.ownersBalance || "0",
        total_venear_balance: stats.veNearBalance || "0",
        is_delegate: isDelegate,
        delegation_count: delegateProfile?.numOfDelegators || "0",
        has_voted: hasVoted,
        lockup_count: lockupCount,
      };

      // Identify user with these enriched properties.
      // `identifyUser` handles the necessary Mixpanel/GA logic and property merging.
      // Note: `wallet_type` and `is_fireblocks` are set separately during initial connection event.
      identifyUser(signedAccountId, userProperties);

      // Mark as identified to prevent duplicate calls for this session
      hasIdentified.current = true;
    }
  }, [
    signedAccountId,
    isStatsLoading,
    stats,
    isDelegateLoading,
    delegateProfile,
  ]);

  // Reset the identification flag if the active account changes,
  // prompting a re-fetch and re-identify for the new user.
  useEffect(() => {
    hasIdentified.current = false;
  }, [signedAccountId]);

  return null;
}
