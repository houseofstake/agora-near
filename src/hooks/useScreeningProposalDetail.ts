import { useQuery } from "@tanstack/react-query";
import { fetchScreeningProposalDetail } from "@/lib/api/governance/requests";

export const useScreeningProposalDetail = (proposalId: string | undefined) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["screening-committee", "proposals", proposalId],
    queryFn: () => fetchScreeningProposalDetail(proposalId!),
    enabled: !!proposalId,
    staleTime: 1000 * 60,
  });

  return {
    proposal: data?.proposal,
    governanceStatus: data?.governanceStatus,
    reviews: data?.reviews,
    members: data?.members,
    isLoading,
    error,
  };
};
