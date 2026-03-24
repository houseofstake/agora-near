import { useQuery } from "@tanstack/react-query";
import { fetchCouncilProposals } from "@/lib/api/governance/requests";
import type { CouncilStats } from "@/lib/api/governance/types";

export const useCouncilProposals = ({
  status,
  page,
  pageSize,
  search,
  wallet,
}: {
  status: "active" | "passed" | "vetoed";
  page: number;
  pageSize: number;
  search?: string;
  wallet?: string;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["security-council", "proposals", status, page, search, wallet],
    queryFn: () => fetchCouncilProposals(status, page, pageSize, search, wallet),
    refetchInterval: 1000 * 60 * 2,
  });

  return {
    proposals: data?.proposals,
    stats: data?.stats as CouncilStats | undefined,
    count: data?.count,
    page: data?.page,
    totalPages: data?.totalPages,
    isLoading,
    error,
  };
};
