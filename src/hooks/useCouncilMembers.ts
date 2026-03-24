import { useQuery } from "@tanstack/react-query";
import { fetchCouncilMembers } from "@/lib/api/governance/requests";

export const useCouncilMembers = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["security-council", "members"],
    queryFn: fetchCouncilMembers,
    staleTime: 1000 * 60 * 5,
  });

  return { members: data, isLoading, error };
};
