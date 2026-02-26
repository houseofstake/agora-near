import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { READ_NEAR_CONTRACT_QK } from "@/hooks/useReadHOSContract";
import { useWriteHOSContract } from "./useWriteHOSContract";

type Props = {
  lockupAccountId: string;
};

export const useUnselectStakingPool = ({ lockupAccountId }: Props) => {
  const [isUnselecting, setIsUnselecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { mutateAsync: mutateUnselectPool } = useWriteHOSContract({
    contractType: "LOCKUP",
  });

  const queryClient = useQueryClient();

  const unselectStakingPool = useCallback(async () => {
    try {
      setIsUnselecting(true);
      setError(null);

      await mutateUnselectPool({
        contractId: lockupAccountId,
        methodCalls: [
          {
            methodName: "unselect_staking_pool",
            args: {},
          },
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [READ_NEAR_CONTRACT_QK, lockupAccountId],
      });
    } catch (e) {
      console.error("[unselectStakingPool] error", e);
      setError(e as Error);
      throw e;
    } finally {
      setIsUnselecting(false);
    }
  }, [mutateUnselectPool, lockupAccountId, queryClient]);

  return {
    unselectStakingPool,
    isUnselecting,
    error,
  };
};
