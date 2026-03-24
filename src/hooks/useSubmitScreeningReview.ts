import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitScreeningReview } from "@/lib/api/governance/requests";
import type { SubmitReviewRequest } from "@/lib/api/governance/types";
import { useNear } from "@/contexts/NearContext";
import { useCallback, useState } from "react";

export const useSubmitScreeningReview = (proposalId: string) => {
  const queryClient = useQueryClient();
  const { signMessage, signedAccountId } = useNear();
  const [signingError, setSigningError] = useState<Error | null>(null);

  const { mutate, mutateAsync, isPending, error: mutationError } = useMutation({
    mutationFn: (body: SubmitReviewRequest) =>
      submitScreeningReview(proposalId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["screening-committee", "proposals"],
      });
    },
  });

  const submitReview = useCallback(
    async (data: { action?: "APPROVE" | "REJECT" | "COMMENT"; rationale?: string }) => {
      if (!signedAccountId) {
        setSigningError(new Error("Wallet not connected"));
        return;
      }
      setSigningError(null);

      const message = JSON.stringify({
        proposalId,
        ...data,
      });

      let signature;
      try {
        signature = await signMessage({ message });
      } catch (err) {
        setSigningError(err instanceof Error ? err : new Error("Signature failed"));
        return;
      }

      if (!signature || !signature.signature || !signature.publicKey) {
        setSigningError(new Error("Signature was rejected or incomplete"));
        return;
      }

      return mutateAsync({
        accountId: signedAccountId,
        signature: signature.signature,
        publicKey: signature.publicKey,
        message,
        data,
      });
    },
    [signedAccountId, signMessage, proposalId, mutateAsync]
  );

  return {
    submitReview,
    isSubmitting: isPending,
    error: signingError || mutationError,
  };
};
