import { UpdatedButton } from "@/components/Button";
import TokenAmount from "@/components/shared/TokenAmount";
import { useCurrentStakingPoolId } from "@/hooks/useCurrentStakingPoolId";
import { useLockupAccount } from "@/hooks/useLockupAccount";
import { useStakedBalance } from "@/hooks/useStakedBalance";
import { useStakeNear } from "@/hooks/useStakeNear";
import { useUnstakedBalance } from "@/hooks/useUnstakedBalance";
import { useUnselectStakingPool } from "@/hooks/useUnselectStakingPool";
import { AlertTriangle, Clock } from "lucide-react";
import Big from "big.js";

type SwitchPoolDialogProps = {
  onClose: () => void;
  onSuccess?: () => void;
};

export const SwitchPoolDialog = ({
  onClose,
  onSuccess,
}: SwitchPoolDialogProps) => {
  const { lockupAccountId } = useLockupAccount();
  const { stakingPoolId } = useCurrentStakingPoolId({
    lockupAccountId: lockupAccountId ?? "",
    enabled: !!lockupAccountId,
  });

  const { stakedBalance, isLoading: isLoadingStaked } = useStakedBalance({
    stakingPoolId,
    accountId: lockupAccountId,
  });

  const {
    unstakedBalance,
    isAvailable,
    isLoading: isLoadingUnstaked,
  } = useUnstakedBalance({
    stakingPoolId,
    accountId: lockupAccountId,
  });

  const {
    unstakeAll,
    withdrawAll,
    isUnstakingAll,
    isWithdrawingAll,
    unstakingAllError,
    withdrawingAllError,
  } = useStakeNear({
    lockupAccountId: lockupAccountId ?? "",
  });

  const {
    unselectStakingPool,
    isUnselecting,
    error: unselectError,
  } = useUnselectStakingPool({ lockupAccountId: lockupAccountId ?? "" });

  const hasStakedBalance = Big(stakedBalance ?? "0").gt(0);
  const hasUnstakedBalance = Big(unstakedBalance ?? "0").gt(0);

  const handleUnstakeAll = async () => {
    try {
      await unstakeAll();
    } catch (e) {
      console.error(e);
    }
  };

  const handleWithdrawAll = async () => {
    try {
      await withdrawAll();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnselect = async () => {
    try {
      await unselectStakingPool();
      onSuccess?.();
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  const isLoading = isLoadingStaked || isLoadingUnstaked;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="py-8 text-center text-sm text-secondary">
          Loading pool status...
        </div>
      );
    }

    if (!stakingPoolId) {
      return (
        <div className="flex flex-col gap-4 text-center">
          <p className="text-secondary text-sm">
            You do not have a staking pool selected. You can close this and lock
            a token to select one automatically.
          </p>
          <UpdatedButton onClick={onClose} type="primary" variant="rounded">
            Done
          </UpdatedButton>
        </div>
      );
    }

    if (hasStakedBalance) {
      return (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-secondary">
            You currently have staked NEAR in <strong>{stakingPoolId}</strong>.
            To switch pools, you must first unstake everything. This will
            initiate a cooldown period of approximately 45-65 hours.
          </p>
          <div className="bg-orange-50 p-4 rounded-lg flex gap-3 text-orange-800 text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-orange-500 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-semibold">Staked Balance:</span>
              <TokenAmount amount={stakedBalance!} /> NEAR
            </div>
          </div>
          {unstakingAllError && (
            <p className="text-red-500 text-sm">{unstakingAllError.message}</p>
          )}
          <UpdatedButton
            loading={isUnstakingAll}
            onClick={handleUnstakeAll}
            type="primary"
            variant="rounded"
            className="w-full"
          >
            Unstake All
          </UpdatedButton>
        </div>
      );
    }

    if (hasUnstakedBalance && !isAvailable) {
      return (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-secondary">
            Your unstaked NEAR is currently in the cooldown period. You must
            wait for it to become available to withdraw before you can switch
            pools.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-blue-800 text-sm border border-blue-100">
            <Clock className="w-5 h-5 flex-shrink-0 text-blue-500 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-semibold">Pending Withdrawal:</span>
              <TokenAmount amount={unstakedBalance!} /> NEAR
            </div>
          </div>
          <p className="text-xs text-secondary text-center">
            Cooldown takes ~45-65 hours after unstaking. Check back later.
          </p>
          <UpdatedButton
            onClick={onClose}
            type="primary"
            variant="rounded"
            className="w-full"
          >
            Close
          </UpdatedButton>
        </div>
      );
    }

    if (hasUnstakedBalance && isAvailable) {
      return (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-secondary">
            Your unstaked NEAR is ready to be withdrawn. Withdraw it to proceed
            with unselecting your current pool.
          </p>
          <div className="bg-green-50 p-4 rounded-lg flex gap-3 text-green-800 text-sm border border-green-200">
            <div className="flex flex-col gap-1">
              <span className="font-semibold">Available to Withdraw:</span>
              <TokenAmount amount={unstakedBalance!} /> NEAR
            </div>
          </div>
          {withdrawingAllError && (
            <p className="text-red-500 text-sm">
              {withdrawingAllError.message}
            </p>
          )}
          <UpdatedButton
            loading={isWithdrawingAll}
            onClick={handleWithdrawAll}
            type="primary"
            variant="rounded"
            className="w-full"
          >
            Withdraw All
          </UpdatedButton>
        </div>
      );
    }

    // No staked balance, no unstaked balance. They can safely unselect.
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-secondary">
          Your lockup holds no funds in the current pool (
          <strong>{stakingPoolId}</strong>). You can now safely unselect it,
          which will allow you to lock a new LST.
        </p>
        {unselectError && (
          <p className="text-red-500 text-sm">{unselectError.message}</p>
        )}
        <UpdatedButton
          loading={isUnselecting}
          onClick={handleUnselect}
          type="primary"
          variant="rounded"
          className="w-full"
        >
          Unselect Pool
        </UpdatedButton>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 h-full w-full">
      <div className="flex flex-col gap-6 w-full pt-4">
        <h2 className="text-2xl font-bold text-left text-primary">
          Switch Staking Pool
        </h2>
        {renderContent()}
      </div>
    </div>
  );
};
