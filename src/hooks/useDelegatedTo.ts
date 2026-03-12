import { Endpoint } from "@/lib/api/constants";
import { fetchDelegationTo } from "@/lib/api/delegates/requests";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const DELEGATED_TO_QK = `${Endpoint.Delegates}/delegated-to`;

export const useDelegatedTo = ({
  pageSize,
  address,
  enabled = true,
}: {
  pageSize: number;
  address: string;
  enabled?: boolean;
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
    queryKey: [DELEGATED_TO_QK],
    queryFn: ({ pageParam = 1 }) => {
      return fetchDelegationTo(pageSize, pageParam, address);
    },
    getNextPageParam: (currentPage, _, pageParam) => {
      if (currentPage.count <= pageParam * pageSize) return undefined;

      return pageParam + 1;
    },
    initialPageParam: 1,
    enabled: enabled && !!address,
  });

  const flatData = useMemo(() => {
    const records = data?.pages.map((page) => page.events).flat();
    return records?.flat();
  }, [data]);

  return {
    data: flatData,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  };
};
