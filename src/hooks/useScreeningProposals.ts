import { useQuery } from "@tanstack/react-query";
import { fetchScreeningProposals } from "@/lib/api/governance/requests";
import type { ScreeningStats } from "@/lib/api/governance/types";

export const useScreeningProposals = ({
  status,
  page,
  pageSize,
  search,
  wallet,
}: {
  status: "current" | "incoming" | "past";
  page: number;
  pageSize: number;
  search?: string;
  wallet?: string;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: [
      "screening-committee",
      "proposals",
      status,
      page,
      search,
      wallet,
    ],
    queryFn: () =>
      fetchScreeningProposals(status, page, pageSize, search, wallet),
    refetchInterval: 1000 * 60 * 2,
  });

  return {
    proposals: data?.proposals,
    stats: data?.stats as ScreeningStats | undefined,
    count: data?.count,
    page: data?.page,
    totalPages: data?.totalPages,
    isLoading,
    error,
  };
};
