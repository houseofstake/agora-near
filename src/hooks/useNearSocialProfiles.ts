import { useQuery } from "@tanstack/react-query";
import { useNear } from "@/contexts/NearContext";
import {
  extractNearSocialDisplayNames,
  getNearSocialContractId,
} from "@/lib/nearSocial";

export const NEAR_SOCIAL_PROFILES_QK = "near-social-profiles";

export const useNearSocialProfiles = (accountIds: string[]) => {
  const { viewMethod } = useNear();
  const contractId = getNearSocialContractId();

  const uniqueIds = Array.from(new Set(accountIds)).filter(Boolean).sort();

  return useQuery({
    queryKey: [NEAR_SOCIAL_PROFILES_QK, contractId, uniqueIds],
    queryFn: async () => {
      if (uniqueIds.length === 0) {
        return {};
      }

      const response = await viewMethod({
        contractId,
        method: "get",
        args: {
          keys: uniqueIds.map((id) => `${id}/hos/profile/name`),
        },
      });

      return extractNearSocialDisplayNames(response, uniqueIds);
    },
    enabled: uniqueIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });
};
