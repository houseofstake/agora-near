import { UpdatedButton } from "@/components/Button";
import { Input } from "@/components/ui/input";
import { TooltipWithTap } from "@/components/ui/tooltip-with-tap";
import {
  DEFAULT_GAS_RESERVE,
  NEAR_TOKEN,
  VENEAR_TOKEN_METADATA,
} from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import { ArrowDownIcon } from "@heroicons/react/20/solid";
import {
  ChevronDownIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import Big from "big.js";
import { useCallback, useMemo } from "react";
import { AssetIcon } from "../../common/AssetIcon";
import TokenAmount from "../../shared/TokenAmount";
import { useLockProviderContext } from "../LockProvider";

import { useStakedBalance } from "@/hooks/useStakedBalance";
import { formatNearAmount } from "@near-js/utils";
import { useAnalytics } from "@/hooks/useAnalytics";

type EnterAmountStepProps = {
  openAssetSelector: () => void;
  handleReview: () => void;
};

export const EnterAmountStep = ({
  openAssetSelector,
  handleReview,
}: EnterAmountStepProps) => {
  const {
    enteredAmount,
    onLockMax,
    selectedToken,
    venearAmount,
    lockApy: annualAPY,
    isLoading,
    setEnteredAmount,
    maxAmountToLock,
    amountError,
    isLockingMax,
    lstPriceYocto,
    lockupAccountId,
    stakingPoolId,
  } = useLockProviderContext();

  useStakedBalance({
    stakingPoolId,
    accountId: lockupAccountId,
  });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEnteredAmount(value);
  };
  const onMaxPressed = useCallback(() => {
    onLockMax();
  }, [onLockMax]);

  const formattedVeNearAmount = useMemo(() => {
    return (
      <TokenAmount
        amount={Big(venearAmount ?? "0").lte(0) ? "0" : (venearAmount ?? "0")}
        hideCurrency
        minimumFractionDigits={4}
        className="tabular-nums text-lg"
      />
    );
  }, [venearAmount]);

  const shouldDisableButton =
    !enteredAmount || Number(enteredAmount) === 0 || isLoading || !!amountError;

  const showConversion = useMemo(() => {
    return selectedToken?.type === "lst" && !!lstPriceYocto;
  }, [selectedToken?.type, lstPriceYocto]);

  const conversionText = useMemo(() => {
    if (!showConversion) return null;
    const nearPerLst = formatNearAmount(lstPriceYocto ?? "0", 4);
    const symbol = selectedToken?.metadata?.symbol ?? "";
    return `1 ${symbol} ≈ ${nearPerLst} NEAR`;
  }, [lstPriceYocto, selectedToken?.metadata?.symbol, showConversion]);

  const { trackLockAmountEntered } = useAnalytics();

  const onProceed = () => {
    trackLockAmountEntered({
      amount_near: Number(enteredAmount),
      lock_duration_days: 0, // No duration selection in this flow currently
      lst_selected: selectedToken?.metadata?.symbol || "NEAR",
    });
    handleReview();
  };

  return (
    <div className="flex flex-col gap-6 h-full w-full">
      <p className="text-2xl font-bold text-left text-primary">
        Lock assets and gain voting power
      </p>
      <div className="flex flex-col gap-1">
        <div className="flex items-center text-sm text-secondary">
          <span>Available to lock</span>
          <TooltipWithTap
            content={
              <div className="max-w-[300px] flex flex-col text-left p-3">
                <h4 className="text-lg font-bold mb-2">Available to lock</h4>
                <p className="text-sm">
                  {`Amount available to lock, with ${formatNearAmount(
                    DEFAULT_GAS_RESERVE
                  )} NEAR reserved for gas fees.`}
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
              amount={maxAmountToLock ?? "0"}
              minimumFractionDigits={4}
              currency={selectedToken?.metadata?.symbol}
            />
          </span>
          <div className="h-[16px]">
            <p className="text-sm text-red-500">{amountError}</p>
          </div>
        </div>
      </div>
      <div className="relative flex h-auto sm:h-[150px] min-h-[180px] sm:min-h-[150px] flex-col border border-line rounded-xl">
        <div className="flex-1 flex flex-col">
          <div className="flex flex-col sm:flex-row w-full items-start sm:items-center p-4 gap-3 sm:gap-0">
            <div className="flex-shrink-0 w-full sm:w-auto">
              <button
                onClick={openAssetSelector}
                className="flex flex-row items-center gap-2 bg-[#F2F1EA] px-3 py-1.5 rounded-md hover:bg-opacity-80 w-full sm:w-auto justify-center sm:justify-start"
              >
                <AssetIcon
                  icon={selectedToken?.metadata?.icon ?? ""}
                  name={selectedToken?.metadata?.name ?? ""}
                />
                <span className="font-medium text-sm">
                  {selectedToken?.metadata?.symbol ?? "Select Token"}
                </span>
                <ChevronDownIcon className="w-4 h-4 text-primary" />
              </button>
            </div>
            <div className="flex-1 flex flex-row w-full min-w-0 overflow-hidden">
              <Input
                type="text"
                placeholder="0"
                value={
                  // Override value for display purposes when locking max
                  isLockingMax
                    ? formatNumber(maxAmountToLock ?? "0", NEAR_TOKEN.decimals)
                    : enteredAmount
                }
                onChange={handleAmountChange}
                className="w-full bg-transparent border-none text-lg text-right h-auto focus-visible:ring-0 focus-visible:ring-offset-0 pr-2"
              />
              <button
                onClick={onMaxPressed}
                disabled={!maxAmountToLock || Big(maxAmountToLock).lte(0)}
                className="px-3 py-1 text-sm text-[#00E391] hover:bg-[#00E391] hover:text-white rounded transition-colors duration-200 flex-shrink-0"
              >
                Max
              </button>
            </div>
          </div>
        </div>
        {showConversion && (
          <div className="px-4 pb-2 -mt-2 text-xs text-secondary">
            {conversionText}
          </div>
        )}
        <div className="absolute left-1/2 top-[64%] sm:top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-8 h-8 flex items-center justify-center bg-neutral border border-line rounded-full">
            <ArrowDownIcon className="w-4 h-4 text-primary" />
          </div>
        </div>
        <div className="border-t border-line"></div>
        <div className="flex-1 flex">
          <div className="flex flex-row w-full items-center justify-between p-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md">
              <AssetIcon
                icon={VENEAR_TOKEN_METADATA.icon}
                name={VENEAR_TOKEN_METADATA.name}
              />
              <span className="font-medium text-sm">veNEAR</span>
            </div>
            {formattedVeNearAmount}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1 text-sm">
        <div className="flex flex-row justify-between">
          <span className="text-secondary">Voting Power Growth</span>
          <span className="text-primary font-bold">{annualAPY}%</span>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-end pb-4">
        <UpdatedButton
          onClick={onProceed}
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
