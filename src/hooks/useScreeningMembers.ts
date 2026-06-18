import { useQuery } from "@tanstack/react-query";
import { fetchScreeningMembers } from "@/lib/api/governance/requests";

export const useScreeningMembers = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["screening-committee", "members"],
    queryFn: fetchScreeningMembers,
    staleTime: 1000 * 60 * 5,
  });

  return { members: data, isLoading, error };
};
