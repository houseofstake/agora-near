import { useReadHOSContract } from "./useReadHOSContract";

export const useCurrentStakingPoolId = ({
  lockupAccountId,
  enabled = true,
}: {
  lockupAccountId?: string;
  enabled?: boolean;
}) => {
  const [
    {
      data: stakingPoolId,
      isLoading: isLoadingStakingPoolId,
      error: stakingPoolError,
    },
  ] = useReadHOSContract([
    {
      contractId: lockupAccountId ?? "",
      methodName: "get_staking_pool_account_id" as const,
      config: {
        args: {},
        enabled: !!lockupAccountId && enabled,
        staleTime: 0,
      },
    },
  ]);

  return {
    stakingPoolId,
    isLoadingStakingPoolId,
    stakingPoolError,
  };
};
