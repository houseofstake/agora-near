import { useQuery } from "@tanstack/react-query";
import { useNear } from "@/contexts/NearContext";
import {
  extractNearSocialProfile,
  getNearSocialContractId,
} from "@/lib/nearSocial";
import { NearSocialProfile } from "@/lib/nearSocial/types";

export const NEAR_SOCIAL_PROFILE_QK = "near-social-profile";

export const useNearSocialProfile = (accountId: string | undefined) => {
  const { viewMethod } = useNear();
  const contractId = getNearSocialContractId();

  return useQuery({
    queryKey: [NEAR_SOCIAL_PROFILE_QK, contractId, accountId],
    queryFn: async (): Promise<NearSocialProfile | null> => {
      if (!accountId) {
        return null;
      }

      const response = await viewMethod({
        contractId,
        method: "get",
        args: {
          keys: [`${accountId}/hos/profile/**`],
        },
      });

      return extractNearSocialProfile(response, accountId);
    },
    enabled: !!accountId,
    staleTime: 1000 * 60 * 5,
  });
};
