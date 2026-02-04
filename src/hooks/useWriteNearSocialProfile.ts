import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNear } from "@/contexts/NearContext";
import {
  extractRawNearSocialProfile,
  getNearSocialContractId,
  mergeNearSocialProfile,
} from "@/lib/nearSocial";
import { NearSocialProfile } from "@/lib/nearSocial/types";
import { NEAR_SOCIAL_PROFILE_QK } from "./useNearSocialProfile";
import { NEAR_SOCIAL_PROFILES_QK } from "./useNearSocialProfiles";

const ONE_YOCTO = "1";
const STORAGE_DEPOSIT = "100000000000000000000000"; // 0.1 NEAR

export const useWriteNearSocialProfile = () => {
  const { signedAccountId, callMethod, viewMethod } = useNear();
  const queryClient = useQueryClient();
  const contractId = getNearSocialContractId();

  return useMutation({
    mutationFn: async (profileUpdate: NearSocialProfile) => {
      if (!signedAccountId) {
        throw new Error("Not connected");
      }

      const current = await viewMethod({
        contractId,
        method: "get",
        args: {
          keys: [`${signedAccountId}/hos/profile/**`],
        },
      });

      const existingRaw = extractRawNearSocialProfile(current, signedAccountId);

      const mergedProfile = mergeNearSocialProfile(existingRaw, profileUpdate);

      // Check if user has storage balance; if not, attach 0.1 NEAR for registration
      const storageBalance = await viewMethod({
        contractId,
        method: "storage_balance_of",
        args: { account_id: signedAccountId },
      });

      const deposit = storageBalance ? ONE_YOCTO : STORAGE_DEPOSIT;

      return callMethod({
        contractId,
        method: "set",
        deposit,
        args: {
          data: {
            [signedAccountId]: {
              hos: {
                profile: mergedProfile,
              },
            },
          },
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [NEAR_SOCIAL_PROFILE_QK, contractId, signedAccountId],
      });
      queryClient.invalidateQueries({
        queryKey: [NEAR_SOCIAL_PROFILES_QK],
      });
    },
  });
};
