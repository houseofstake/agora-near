import { getDelegate } from "@/lib/api/delegates/requests";
import { fetchVoteHistory } from "@/lib/api/delegates/requests";
import { useQuery } from "@tanstack/react-query";
import { DelegateProfile } from "@/lib/api/delegates/types";
import { CACHE_TTL } from "@/lib/constants";
import { fetchSocialProfile } from "@/lib/near-social";

export const QK_DELEGATE_PROFILE = "delegateProfile";

export const useDelegateProfile = ({ accountId }: { accountId?: string }) => {
  return useQuery({
    queryKey: [QK_DELEGATE_PROFILE, accountId],
    queryFn: async () => {
      const [delegate, socialProfile] = await Promise.all([
        getDelegate(accountId ?? ""),
        fetchSocialProfile(accountId ?? ""),
      ]);

      let baseDelegate = delegate;

      // Enhance with social profile if available
      if (socialProfile) {
        baseDelegate = {
          ...(delegate || {
            address: accountId!,
            votingPower: "0",
          }),
          ...socialProfile,
        } as DelegateProfile;
      }

      if (!baseDelegate) return null;

      // Return early if vote counts are already present
      if (
        baseDelegate.forCount !== null &&
        baseDelegate.forCount !== undefined
      ) {
        return baseDelegate;
      }

      // Fetch and calculate vote counts
      try {
        const voteHistory = await fetchVoteHistory(1000, 1, accountId ?? "");
        let forCount = 0;
        let againstCount = 0;
        let abstainCount = 0;

        voteHistory.votes.forEach((vote) => {
          if (vote.voteOption === "0") forCount++;
          else if (vote.voteOption === "1") againstCount++;
          else if (vote.voteOption === "2") abstainCount++;
        });

        return {
          ...baseDelegate,
          forCount,
          againstCount,
          abstainCount,
        } as DelegateProfile;
      } catch (error) {
        console.error("Error fetching voting history:", error);
        return baseDelegate;
      }
    },
    enabled: !!accountId,
    staleTime: CACHE_TTL.SHORT,
  });
};
