"use client";

import { useMemo } from "react";
import Big from "big.js";
import { UpdatedButton } from "@/components/Button";
import { ExclamationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useLockupAccount } from "@/hooks/useLockupAccount";
import { useLiquidLockupBalance } from "@/hooks/useLiquidLockupBalance";
import { useCurrentStakingPoolId } from "@/hooks/useCurrentStakingPoolId";
import { useStakedBalance } from "@/hooks/useStakedBalance";
import { STAKE_ENCOURAGEMENT_BANNER_DISMISS_KEY } from "@/lib/constants";

type Props = {
  onStakeClick: () => void;
};

export default function StakeEncouragementBanner({ onStakeClick }: Props) {
  const [dismissed, setDismissed] = useLocalStorage<boolean>(
    STAKE_ENCOURAGEMENT_BANNER_DISMISS_KEY,
    false
  );

  const { lockupAccountId, isLoading: isLoadingLockup } = useLockupAccount();
  const { isLoading: isLoadingLiquid, liquidLockupBalance } =
    useLiquidLockupBalance({
      lockupAccountId,
    });
  const { stakingPoolId, isLoadingStakingPoolId } = useCurrentStakingPoolId({
    lockupAccountId,
  });
  const { stakedBalance, isLoading: isLoadingStaked } = useStakedBalance({
    stakingPoolId,
    accountId: lockupAccountId,
  });

  const isLoading =
    isLoadingLockup ||
    isLoadingLiquid ||
    isLoadingStakingPoolId ||
    isLoadingStaked;

  const shouldShow = useMemo(() => {
    if (dismissed || isLoading) return false;
    if (!lockupAccountId) return false;

    const liquid = Big(liquidLockupBalance?.stakableNearBalance ?? "0");
    const withdrawable = Big(
      liquidLockupBalance?.withdrawableNearBalance ?? "0"
    );
    const staked = Big(stakedBalance ?? "0");

    // Show if there is liquid NEAR in the lockup (stakable or withdrawable)
    // and either no pool is selected yet or the current staked amount is 0
    const hasLiquidInLockup = liquid.gt(0) || withdrawable.gt(0);
    const hasNoStake = !stakingPoolId || staked.lte(0);

    return hasLiquidInLockup && hasNoStake;
  }, [
    dismissed,
    isLoading,
    lockupAccountId,
    liquidLockupBalance,
    stakedBalance,
    stakingPoolId,
  ]);

  if (!shouldShow) return null;

  return (
    <div className="w-full rounded-lg border border-negative mt-3 mb-1 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1 flex items-start gap-2 text-primary min-w-0">
          <ExclamationCircleIcon className="w-6 h-6 stroke-negative flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 flex-1">
            <div className="text-base font-bold leading-normal">
              Stake your locked NEAR
            </div>
            <div className="text-sm font-medium leading-[21px]">
              You have NEAR in your lockup that is not staked. Stake it to start
              earning.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-shrink-0">
          <UpdatedButton
            type="primary"
            className="font-medium px-[20px] py-3 w-full sm:w-auto whitespace-nowrap"
            onClick={onStakeClick}
          >
            Stake NEAR
          </UpdatedButton>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-tertiary/10 rounded-md transition-colors flex-shrink-0"
            aria-label="Dismiss banner"
          >
            <XMarkIcon className="w-5 h-5 stroke-secondary" />
          </button>
        </div>
      </div>
    </div>
  );
}
