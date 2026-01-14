import { UpdatedButton } from "@/components/Button";
import TokenAmount from "@/components/shared/TokenAmount";
import { Input } from "@/components/ui/input";
import { useCurrentStakingPoolId } from "@/hooks/useCurrentStakingPoolId";
import { useLockupAccount } from "@/hooks/useLockupAccount";
import { useStakedBalance } from "@/hooks/useStakedBalance";
import { useStakeNear } from "@/hooks/useStakeNear";
import { NEAR_TOKEN_METADATA } from "@/lib/constants";
import Big from "big.js";
import { useState } from "react";
import toast from "react-hot-toast";
import { UnstakeDialogHeader } from "./UnstakeDialogHeader";
import { AssetIcon } from "../../common/AssetIcon";

type UnstakeDialogProps = {
  closeDialog: () => void;
};

import { useUnstakedBalance } from "@/hooks/useUnstakedBalance";

export const UnstakeDialog = ({ closeDialog }: UnstakeDialogProps) => {
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const { lockupAccountId } = useLockupAccount();
  const { stakingPoolId } = useCurrentStakingPoolId({
    lockupAccountId: lockupAccountId ?? "",
    enabled: !!lockupAccountId,
  });

  const { stakedBalance } = useStakedBalance({
    stakingPoolId,
    accountId: lockupAccountId,
  });

  const { unstakeNear, isUnstakingNear, unstakingNearError } = useStakeNear({
    lockupAccountId: lockupAccountId ?? "",
  });

  const { unstakedBalance, isAvailable: isUnstakedBalanceAvailable } =
    useUnstakedBalance({
      stakingPoolId,
      accountId: lockupAccountId,
    });
  const [showWarning, setShowWarning] = useState(false);

  const validateAmount = (value: string) => {
    if (!value) {
      setAmountError(null);
      return;
    }
    if (Big(value).lte(0)) {
      setAmountError("Amount must be greater than 0");
      return;
    }
    const valueYocto = Big(value).mul(Big(10).pow(24));
    if (valueYocto.gt(Big(stakedBalance ?? "0"))) {
      setAmountError("Not enough balance available to unstake");
      return;
    }
    setAmountError(null);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    validateAmount(value);
  };

  const hasInsufficientBalance = !!amountError;

  const proceedWithUnstake = async () => {
    if (!amount || !lockupAccountId || amountError) return;
    try {
      const amountYocto = Big(amount).mul(Big(10).pow(24)).toFixed(0);
      await unstakeNear(amountYocto);
      closeDialog();
      toast.success("Unstake transaction submitted");
    } catch (e: any) {
      console.error(e);
      const isUserRejected = e?.message?.includes("User rejected");
      if (!isUserRejected) {
        toast.error("Failed to unstake");
      }
    }
  };

  const handleUnstakeClick = async () => {
    if (!amount || !lockupAccountId || amountError) return;

    // Check if there are funds available to withdraw
    if (
      isUnstakedBalanceAvailable &&
      unstakedBalance &&
      Big(unstakedBalance).gt(0)
    ) {
      setShowWarning(true);
      return;
    }

    await proceedWithUnstake();
  };

  const handleMaxClick = () => {
    if (stakedBalance) {
      // Format to NEAR for display/input
      const maxVal = Big(stakedBalance).div(Big(10).pow(24)).toFixed();
      setAmount(maxVal);
      setAmountError(null);
    }
  };

  const isLoading = isUnstakingNear;

  if (showWarning) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <UnstakeDialogHeader />
        <div className="flex flex-col gap-4 mb-6">
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <h3 className="text-yellow-500 font-bold mb-2">
              Warning: Reset Timer
            </h3>
            <p className="text-sm text-secondary">
              You have funds ready to withdraw. If you unstake more now, ALL
              your pending funds (including the ones ready now) will be locked
              for another ~52-65 hours.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <UpdatedButton
            onClick={closeDialog} // Or ideally redirect to Withdraw flow, but keeping it simple for now as requested
            type="secondary"
            className="w-full"
            variant="rounded"
          >
            Cancel & Withdraw First
          </UpdatedButton>
          <UpdatedButton
            onClick={proceedWithUnstake}
            type="primary"
            disabled={isLoading}
            loading={isLoading}
            className="w-full bg-red-500 hover:bg-red-600 border-none text-white"
            variant="rounded"
          >
            I understand, Proceed
          </UpdatedButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <UnstakeDialogHeader />

      <div className="flex flex-col gap-6 mb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center text-sm text-secondary">
            <span>Available to unstake</span>
          </div>
          <div>
            <span className="text-3xl font-bold text-primary">
              <TokenAmount amount={stakedBalance ?? "0"} />
            </span>
            <div className="h-[16px]">
              <p className="text-sm text-red-500">{amountError}</p>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between rounded-lg border border-gray-200 p-4 gap-3 sm:gap-0">
          <div className="flex items-center gap-2 flex-shrink-0">
            <AssetIcon
              icon={NEAR_TOKEN_METADATA.icon}
              name={NEAR_TOKEN_METADATA.name}
            />
            <span className="font-medium">NEAR</span>
          </div>

          <div className="flex items-center flex-1 sm:ml-2 min-w-0">
            <Input
              type="number"
              placeholder="0"
              value={amount}
              onChange={handleAmountChange}
              disabled={isLoading}
              className="w-full bg-transparent border-none text-lg text-right h-auto focus-visible:ring-0 focus-visible:ring-offset-0 pr-2"
            />
            <button
              onClick={handleMaxClick}
              disabled={isLoading || !stakedBalance}
              className="px-3 py-1 text-sm text-[#00E391] hover:bg-[#00E391] hover:text-white rounded transition-colors duration-200 flex-shrink-0"
            >
              Max
            </button>
          </div>
        </div>
      </div>

      {unstakingNearError && (
        <div className="text-red-500 text-sm">{unstakingNearError.message}</div>
      )}

      <div className="flex-1 flex flex-col justify-end gap-2 mt-4">
        <UpdatedButton
          onClick={handleUnstakeClick}
          type={
            !amount || Big(amount ?? 0).eq(0) || hasInsufficientBalance
              ? "disabled"
              : "primary"
          }
          disabled={
            isLoading ||
            !amount ||
            Big(amount ?? 0).eq(0) ||
            hasInsufficientBalance
          }
          loading={isLoading}
          className="w-full"
          variant="rounded"
        >
          Unstake
        </UpdatedButton>
      </div>
    </div>
  );
};
