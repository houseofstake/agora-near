import { Endpoint } from "@/lib/api/constants";
import { fetchDelegationFrom } from "@/lib/api/delegates/requests";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const DELEGATED_FROM_QK = `${Endpoint.Delegates}/delegated-from`;

export const useDelegatedFrom = ({
  pageSize,
  address,
}: {
  pageSize: number;
  address: string;
}) => {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: [DELEGATED_FROM_QK],
    queryFn: ({ pageParam = 1 }) => {
      return fetchDelegationFrom(pageSize, pageParam, address);
    },
    getNextPageParam: (currentPage, _, pageParam) => {
      if (currentPage.count <= pageParam * pageSize) return undefined;

      return pageParam + 1;
    },
    initialPageParam: 1,
  });

  const flatData = useMemo(() => {
    const records = data?.pages.map((page) => page.events).flat();
    return records?.flat();
  }, [data]);

  const selfLockedVotingPower = data?.pages?.[0]?.selfLockedVotingPower;

  return {
    data: flatData,
    selfLockedVotingPower,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  };
};
