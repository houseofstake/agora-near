import { Endpoint } from "@/lib/api/constants";
import { fetchProposalNonVoters } from "@/lib/api/proposal/requests";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export const NON_VOTERS_QK = `${Endpoint.Proposals}/non-voters`;

export const useProposalNonVoters = ({
  proposalId,
  pageSize,
}: {
  proposalId: string;
  pageSize: number;
}) => {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isPending,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: [NON_VOTERS_QK, proposalId],
    queryFn: ({ pageParam = 1 }) => {
      return fetchProposalNonVoters(proposalId, pageSize, pageParam);
    },
    getNextPageParam: (currentPage, _, pageParam) => {
      if (currentPage.count <= pageParam * pageSize) return undefined;

      return pageParam + 1;
    },
    initialPageParam: 1,
  });

  const flatData = useMemo(() => {
    const records = data?.pages.map((page) => page.nonVoters).flat();
    return records?.flat();
  }, [data]);

  return {
    data: flatData,
    error,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  };
};
