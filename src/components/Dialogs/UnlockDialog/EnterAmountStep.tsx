import { UpdatedButton } from "@/components/Button";
import { Input } from "@/components/ui/input";
import { TooltipWithTap } from "@/components/ui/tooltip-with-tap";
import {
  NEAR_TOKEN,
  NEAR_TOKEN_METADATA,
  VENEAR_TOKEN_METADATA,
} from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEnteredAmount(value);
  };

  const onMaxPressed = useCallback(() => {
    onUnlockMax();
  }, [onUnlockMax]);

  const formattedNearAmount = useMemo(() => {
    return (
      <TokenAmount
        amount={Big(nearAmount ?? "0").lte(0) ? "0" : (nearAmount ?? "0")}
        hideCurrency
        minimumFractionDigits={4}
        className="tabular-nums text-lg"
      />
    );
  }, [nearAmount]);

  const shouldDisableButton =
    !enteredAmount || Number(enteredAmount) === 0 || isLoading || !!amountError;

  return (
    <div className="flex flex-col gap-6 h-full w-full">
      <p className="text-2xl font-bold text-left text-primary">Unlock NEAR</p>
      <p className="text-sm text-secondary">
        Unlocking starts the 45-day cooldown. You will lose voting power
        immediately.
      </p>
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
                  rewards eligibility. If you staked your tokens, you&apos;ll
                  need to unstake them first using the Staking dialog (Advanced
                  → Unstake). Note: You cannot unstake from the LST
                  provider&apos;s website (Meta Pool, LiNEAR, etc.) because your
                  lockup contract owns the tokens. Their UI will show zero
                  balance for your wallet. See the{" "}
                  <a
                    href="/info"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700"
                  >
                    FAQ
                  </a>{" "}
                  for the full withdrawal timeline.
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
                    ? formatNumber(
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
          onClick={handleReview}
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
