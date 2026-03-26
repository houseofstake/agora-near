import { UpdatedButton } from "@/components/Button";
import { Input } from "@/components/ui/input";
import { TooltipWithTap } from "@/components/ui/tooltip-with-tap";
import {
  NEAR_TOKEN,
  NEAR_TOKEN_METADATA,
  VENEAR_TOKEN_METADATA,
} from "@/lib/constants";
import { convertYoctoToNear } from "@/lib/utils";
import { ArrowDownIcon } from "@heroicons/react/20/solid";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import Big from "big.js";
import { useCallback, useMemo } from "react";
import { AssetIcon } from "../../common/AssetIcon";
import TokenAmount from "../../shared/TokenAmount";
import { useUnlockProviderContext } from "../UnlockProvider";
import { UnlockWarning } from "./UnlockWarning";

type EnterAmountStepProps = {
  handleReview: () => void;
};

import { useAnalytics } from "@/hooks/useAnalytics";

export const EnterAmountStep = ({ handleReview }: EnterAmountStepProps) => {
  const {
    enteredAmount,
    onUnlockMax,
    nearAmount,
    isLoading,
    setEnteredAmount,
    maxAmountToUnlock,
    amountError,
    isUnlockingMax,
  } = useUnlockProviderContext();

  const { trackUnlockAmountEntered } = useAnalytics();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Prevent React's synthetic event from overriding 'Max' flag with invalid "0"
    // when setting the bypass layout string
    if (
      isUnlockingMax &&
      value ===
        convertYoctoToNear(maxAmountToUnlock ?? "0", NEAR_TOKEN.decimals)
    ) {
      return;
    }

    setEnteredAmount(value);
  };

  const onContinue = useCallback(() => {
    const maxNear = Big(maxAmountToUnlock ?? "0").div(Big(10).pow(24));
    const entered = isUnlockingMax ? maxNear : Big(enteredAmount || "0");
    const remaining = maxNear.minus(entered);

    trackUnlockAmountEntered({
      unlock_amount_near: entered.toNumber(),
      remaining_after_unlock: remaining.toNumber(),
    });
    handleReview();
  }, [
    enteredAmount,
    handleReview,
    maxAmountToUnlock,
    isUnlockingMax,
    trackUnlockAmountEntered,
  ]);

  const onMaxPressed = useCallback(() => {
    onUnlockMax();
  }, [onUnlockMax]);

  const formattedNearAmount = useMemo(() => {
    // Preserve exact precision for microscopic yoctoNEAR dust amounts when unlocking Max balance.
    if (
      isUnlockingMax &&
      nearAmount &&
      Big(nearAmount).gt(0) &&
      Big(nearAmount).lt(Big(10).pow(20))
    ) {
      const explicitNumStr = convertYoctoToNear(
        nearAmount,
        NEAR_TOKEN.decimals
      );
      return (
        <span className="tabular-nums text-lg font-mono">{explicitNumStr}</span>
      );
    }

    return (
      <TokenAmount
        amount={Big(nearAmount ?? "0").lte(0) ? "0" : (nearAmount ?? "0")}
        hideCurrency
        minimumFractionDigits={4}
        className="tabular-nums text-lg"
      />
    );
  }, [nearAmount, isUnlockingMax]);

  const shouldDisableButton =
    (!enteredAmount && !isUnlockingMax) ||
    (enteredAmount && !isUnlockingMax && Big(enteredAmount).lte(0)) ||
    isLoading ||
    !!amountError;

  return (
    <div className="flex flex-col gap-6 h-full w-full">
      <p className="text-2xl font-bold text-left text-primary">Unlock tokens</p>
      <div className="flex flex-col gap-1">
        <div className="flex items-center text-sm text-secondary">
          <span>Available to unlock</span>
          <TooltipWithTap
            content={
              <div className="max-w-[300px] flex flex-col text-left p-3">
                <h4 className="text-lg font-bold mb-2">
                  Amount available to unlock
                </h4>
                <p className="text-sm">
                  You can unlock this balance but will lose voting power and
                  rewards. Any staked assets you have locked will not be
                  available until they are unlocked through the staking pool.
                  Currently, this is not possible through this UI, instead the
                  operation can be done by directly interacting with the
                  contracts. It is expected that staking balances will be zero
                  on the third-party platforms due to your lock-up contract
                  being the owner. See the{" "}
                  <a
                    href="https://hos-docs.vercel.app/docs/overview/faqs#fungible-token-withdrawal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700"
                  >
                    FAQ
                  </a>
                </p>
              </div>
            }
          >
            <InformationCircleIcon className="w-4 h-4 ml-1 text-secondary" />
          </TooltipWithTap>
        </div>
        <div>
          <span className="text-3xl font-bold text-primary">
            <TokenAmount
              amount={maxAmountToUnlock ?? "0"}
              minimumFractionDigits={4}
              currency="veNEAR"
              showDustTooltip={true}
            />
          </span>
          <div className="h-[16px]">
            <p className="text-sm text-red-500">{amountError}</p>
          </div>
        </div>
      </div>
      <div className="relative flex h-[150px] flex-col border border-line rounded-lg">
        <div className="flex-1 flex">
          <div className="flex flex-row w-full items-center p-4">
            <div className="flex-1">
              <div className="flex flex-row items-center gap-2 px-3 py-1.5 rounded-md">
                <AssetIcon
                  icon={VENEAR_TOKEN_METADATA.icon}
                  name={VENEAR_TOKEN_METADATA.name}
                />
                <span className="font-medium text-sm">veNEAR</span>
              </div>
            </div>
            <div className="flex-1 grow flex flex-row max-w-[350px] overflow-hidden">
              <Input
                type="text"
                placeholder="0"
                value={
                  // Override value for display purposes when unlocking max
                  isUnlockingMax
                    ? convertYoctoToNear(
                        maxAmountToUnlock ?? "0",
                        NEAR_TOKEN.decimals
                      )
                    : enteredAmount
                }
                onChange={handleAmountChange}
                className="w-full bg-transparent border-none text-lg text-right h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <button
              onClick={onMaxPressed}
              disabled={!maxAmountToUnlock || Big(maxAmountToUnlock).lte(0)}
              className="px-3 py-1 text-sm text-[#00E391] hover:bg-[#00E391] hover:text-white rounded transition-colors duration-200"
            >
              Max
            </button>
          </div>
        </div>
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-8 h-8 flex items-center justify-center bg-neutral border border-line rounded-full">
            <ArrowDownIcon className="w-4 h-4 text-primary" />
          </div>
        </div>
        <div className="border-t border-line"></div>
        <div className="flex-1 flex">
          <div className="flex flex-row w-full items-center justify-between p-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md">
              <AssetIcon
                icon={NEAR_TOKEN_METADATA.icon}
                name={NEAR_TOKEN_METADATA.name}
              />
              <span className="font-medium text-sm">NEAR</span>
            </div>
            {formattedNearAmount}
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-end pb-4 gap-4">
        <UnlockWarning />
        <UpdatedButton
          onClick={onContinue}
          type={shouldDisableButton ? "disabled" : "primary"}
          disabled={shouldDisableButton}
          className="w-full"
          variant="rounded"
        >
          Review
        </UpdatedButton>
      </div>
    </div>
  );
};
