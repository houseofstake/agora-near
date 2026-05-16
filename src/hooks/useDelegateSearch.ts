import { Endpoint } from "@/lib/api/constants";
import { searchDelegates } from "@/lib/api/delegates/requests";
import { DelegateSearchResponse } from "@/lib/api/delegates/types";
import { useQuery } from "@tanstack/react-query";

const DELEGATE_SEARCH_QK = `${Endpoint.Delegates}/search`;

const ORDER_BY_TO_SORT: Record<string, string[]> = {
  most_voting_power: ["votingPower:desc"],
  least_voting_power: ["votingPower:asc"],
  most_recent_vote: ["lastVoteTimestamp:desc"],
  least_recent_vote: ["lastVoteTimestamp:asc"],
  most_recent_delegation: ["lastDelegationTimestamp:desc"],
  least_recent_delegation: ["lastDelegationTimestamp:asc"],
  most_aligned: ["herdAlignmentRate:desc"],
  least_aligned: ["herdAlignmentRate:asc"],
  most_participation: ["participationRate:desc"],
  least_participation: ["participationRate:asc"],
};

function buildSearchFilter(
  filterParam: string | null,
  issuesParam: string | null
): string | undefined {
  const parts: string[] = [];
  if (filterParam === "endorsed") {
    parts.push("endorsed = true");
  }
  if (issuesParam) {
    const issues = issuesParam.split(",").filter(Boolean);
    if (issues.length > 0) {
      const issueFilters = issues
        .map((i) => `issueTypes = "${i.trim()}"`)
        .join(" OR ");
      parts.push(`(${issueFilters})`);
    }
  }
  if (parts.length === 0) return undefined;
  return parts.join(" AND ");
}

export function useDelegateSearch(
  query: string,
  opts?: {
    sort?: string[];
    orderBy?: string | null;
    filter?: string | null;
    filterParam?: string | null;
    issuesParam?: string | null;
    limit?: number;
    offset?: number;
  }
) {
  const sort =
    opts?.sort ??
    (opts?.orderBy ? ORDER_BY_TO_SORT[opts.orderBy] : undefined);
  const filter =
    opts?.filter ??
    buildSearchFilter(opts?.filterParam ?? null, opts?.issuesParam ?? null);

  const { data, isLoading, error } = useQuery<DelegateSearchResponse>({
    queryKey: [DELEGATE_SEARCH_QK, query, sort, filter, opts?.limit, opts?.offset],
    queryFn: () =>
      searchDelegates({
        q: query,
        sort,
        filter,
        limit: opts?.limit ?? 10,
        offset: opts?.offset ?? 0,
      }),
    enabled: !!query.trim(),
  });

  return { data, isLoading, error };
}
