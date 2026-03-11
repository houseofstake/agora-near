import { Endpoint } from "@/lib/api/constants";
import {
  fetchProposalVotes,
  ProposalVotesParams,
} from "@/lib/api/proposal/requests";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export const VOTES_QK = `${Endpoint.Proposals}/votes`;

export const useProposalVotes = ({
  proposalId,
  pageSize,
  ...params
}: {
  proposalId: string;
  pageSize: number;
} & ProposalVotesParams) => {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isPending,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: [VOTES_QK, proposalId, params],
    queryFn: ({ pageParam = 1 }) => {
      return fetchProposalVotes(proposalId, pageSize, pageParam, params);
    },
    getNextPageParam: (currentPage, _, pageParam) => {
      if (currentPage.count <= pageParam * pageSize) return undefined;

      return pageParam + 1;
    },
    initialPageParam: 1,
  });

  const flatData = useMemo(() => {
    const records = data?.pages.map((page) => page.votes).flat();
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
