import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNear } from "@/contexts/NearContext";
import {
  extractRawNearSocialProfile,
  getNearSocialContractId,
  mergeNearSocialProfile,
  calculatePayloadSize,
} from "@/lib/nearSocial";
import { NearSocialProfile } from "@/lib/nearSocial/types";
import { NEAR_SOCIAL_PROFILE_QK } from "./useNearSocialProfile";
import { NEAR_SOCIAL_PROFILES_QK } from "./useNearSocialProfiles";

const ONE_YOCTO = "1";
const STORAGE_DEPOSIT = "100000000000000000000000"; // 0.1 NEAR
const YOCTO_PER_BYTE = 10_000_000_000_000_000_000n; // 0.00001 NEAR/byte

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

      // Check storage bounds and balance to calculate the required deposit delta.
      let storageBounds: { min?: string; max?: string } | null = null;
      let storageBalance = null;
      try {
        storageBounds = await viewMethod({
          contractId,
          method: "storage_balance_bounds",
          args: {},
        });

        storageBalance = await viewMethod({
          contractId,
          method: "storage_balance_of",
          args: { account_id: signedAccountId },
        });
      } catch (error) {
        console.warn(
          "Failed to check storage balance/bounds, using fallback deposit:",
          error
        );
      }

      const dataPayload = {
        [signedAccountId]: {
          hos: {
            profile: mergedProfile,
          },
        },
      };

      const estimatedBytes = calculatePayloadSize(dataPayload);
      const bufferedBytes = Math.ceil(estimatedBytes * 1.5);
      let requiredDeposit = BigInt(bufferedBytes) * YOCTO_PER_BYTE;
      const minBound = storageBounds?.min ? BigInt(storageBounds.min) : 0n;
      if (minBound > requiredDeposit) {
        requiredDeposit = minBound;
      }

      const totalBalance =
        storageBalance && typeof storageBalance.total === "string"
          ? BigInt(storageBalance.total)
          : 0n;
      const depositDelta =
        requiredDeposit > totalBalance ? requiredDeposit - totalBalance : 0n;

      const deposit = depositDelta > 0n ? depositDelta.toString() : ONE_YOCTO;

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
