import { useQuery } from "@tanstack/react-query";
import { fetchCouncilProposalDetail } from "@/lib/api/governance/requests";

export const useCouncilProposalDetail = (proposalId: string | undefined) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["security-council", "proposals", proposalId],
    queryFn: () => fetchCouncilProposalDetail(proposalId!),
    enabled: !!proposalId,
    staleTime: 1000 * 60,
  });

  return {
    proposal: data?.proposal,
    governanceStatus: data?.governanceStatus,
    reviews: data?.reviews,
    vetoRationale: data?.vetoRationale,
    isLoading,
    error,
  };
};
