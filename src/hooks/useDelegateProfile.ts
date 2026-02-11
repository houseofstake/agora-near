import { getDelegate } from "@/lib/api/delegates/requests";
import { fetchVoteHistory } from "@/lib/api/delegates/requests";
import { useQuery } from "@tanstack/react-query";
import { DelegateProfile } from "@/lib/api/delegates/types";
import { CACHE_TTL } from "@/lib/constants";

export const QK_DELEGATE_PROFILE = "delegateProfile";

export const useDelegateProfile = ({ accountId }: { accountId?: string }) => {
  return useQuery({
    queryKey: [QK_DELEGATE_PROFILE, accountId],
    queryFn: async () => {
      const delegate = await getDelegate(accountId ?? "");
      if (!delegate) {
        return delegate;
      }
      if (delegate.forCount !== null && delegate.forCount !== undefined) {
        return delegate;
      }
      try {
        const voteHistory = await fetchVoteHistory(1000, 1, accountId ?? "");
        let forCount = 0;
        let againstCount = 0;
        let abstainCount = 0;

        voteHistory.votes.forEach((vote) => {
          if (vote.voteOption === "0") {
            forCount++;
          } else if (vote.voteOption === "1") {
            againstCount++;
          } else if (vote.voteOption === "2") {
            abstainCount++;
          }
        });

        return {
          ...delegate,
          forCount,
          againstCount,
          abstainCount,
        } as DelegateProfile;
      } catch (error) {
        console.error("Error fetching voting history for vote counts:", error);
        return delegate;
      }
    },
    enabled: !!accountId,
    staleTime: CACHE_TTL.SHORT,
  });
};
