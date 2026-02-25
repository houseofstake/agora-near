import {
  default as LockClosedIcon,
  default as LockedIcon,
} from "@/assets/Locked.png";
import LockOpenIcon from "@/assets/Locking.png";
import { UpdatedButton } from "@/components/Button";
import { TransactionError } from "@/components/TransactionError";
import { TooltipWithTap } from "@/components/ui/tooltip-with-tap";
import { useDeployLockupAndLockV2 } from "@/hooks/useDeployLockupAndLockV2";
import { useAnalytics } from "@/hooks/useAnalytics";
import { MIN_VERSION_FOR_LST_LOCKUP } from "@/lib/constants";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import Big from "big.js";
import Image from "next/image";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import TokenAmount from "../../shared/TokenAmount";
import { useLockProviderContext } from "../LockProvider";
import { DepositTooltip } from "./DepositTooltip";
import { DisclosuresContent } from "./DisclosuresContent";
import { LiquidStakingTokenLockWarning } from "./LiquidStakingTokenLockWarning";
import { formatNearAmount, parseNearAmount } from "@near-js/utils";

type ReviewStepProps = {
  handleEdit: () => void;
  handleLockMore: () => void;
  handleProceedToStaking: () => void;
  handleViewDashboard: () => void;
};

export const ReviewStep = memo(
  ({
    handleEdit,
    handleLockMore,
    handleProceedToStaking,
    handleViewDashboard,
  }: ReviewStepProps) => {
    const [showDisclosures, setShowDisclosures] = useState(false);

    const {
      enteredAmount,
      lockApy: annualAPY,
      isLoading,
      venearAmount,
      depositTotal,
      selectedToken,
      lockupAccountId,
      venearStorageCost,
      lockupStorageCost,
      venearAccountLockupVersion,
      venearGlobalLockupVersion,
      lstPriceYocto,
      customStakingPoolId,
    } = useLockProviderContext();

    // Determine if the just-locked amount leaves any liquid NEAR available to stake.
    // If the user only covered the required deposits, there will be nothing to stake.
    const lockedAmountYocto = useMemo(() => {
      return parseNearAmount(enteredAmount) ?? "0";
    }, [enteredAmount]);

    const hasStakeableAfterLock = useMemo(() => {
      if (selectedToken?.type === "lst") return false;
      try {
        return Big(lockedAmountYocto).gt(Big(depositTotal ?? "0"));
      } catch {
        return false;
      }
    }, [depositTotal, lockedAmountYocto, selectedToken?.type]);

    const {
      isSubmitting,
      isCompleted,
      executeTransactions,
      error,
      isFireblocksWallet,
      transactionStep,
      numTransactions,
      transactionText,
      retryFromCurrentStep,
    } = useDeployLockupAndLockV2();

    const handleShowDisclosures = useCallback(() => {
      setShowDisclosures(true);
    }, []);

    const handleHideDisclosures = useCallback(() => {
      setShowDisclosures(false);
    }, []);

    const formattedVeNearAmount = useMemo(() => {
      return (
        <TokenAmount
          amount={venearAmount ?? "0"}
          hideCurrency
          minimumFractionDigits={4}
          className="font-bold text-lg"
        />
      );
    }, [venearAmount]);

    const {
      trackLockReviewStepReached,
      trackLockTransactionInitiated,
      trackLockTransactionSuccess,
      trackLockTransactionFailed,
    } = useAnalytics();

    useEffect(() => {
      trackLockReviewStepReached({
        amount_near: Number(enteredAmount),
        duration_days: 0,
        lst_selected: selectedToken?.metadata?.symbol || "NEAR",
      });
    }, [enteredAmount, selectedToken, trackLockReviewStepReached]);

    useEffect(() => {
      if (isCompleted) {
        trackLockTransactionSuccess({
          amount_near_yocto: lockedAmountYocto,
          duration_days: 0,
          lst_selected: selectedToken?.metadata?.symbol || "NEAR",
          tx_hash: "unknown",
          lockup_id: lockupAccountId ?? undefined,
        });
      }
    }, [
      isCompleted,
      lockedAmountYocto,
      selectedToken,
      lockupAccountId,
      trackLockTransactionSuccess,
    ]);

    useEffect(() => {
      if (error) {
        trackLockTransactionFailed({
          error_type: "transaction_error",
          error_message: error,
        });
      }
    }, [error, trackLockTransactionFailed]);

    const handleTransactionInit = useCallback(() => {
      trackLockTransactionInitiated({
        amount_near: Number(enteredAmount),
        duration_days: 0,
        lst_selected: selectedToken?.metadata?.symbol || "NEAR",
      });
      executeTransactions();
    }, [
      enteredAmount,
      selectedToken,
      trackLockTransactionInitiated,
      executeTransactions,
    ]);

    const shouldShowLSTWarning = useMemo(() => {
      const versionToCheck =
        venearAccountLockupVersion ?? venearGlobalLockupVersion ?? 1;

      return (
        selectedToken?.type === "lst" &&
        versionToCheck < MIN_VERSION_FOR_LST_LOCKUP
      );
    }, [
      selectedToken?.type,
      venearAccountLockupVersion,
      venearGlobalLockupVersion,
    ]);

    if (showDisclosures) {
      return <DisclosuresContent onBack={handleHideDisclosures} />;
    }

    if (isCompleted) {
      // Special UI for LST tokens
      if (selectedToken?.type === "lst") {
        return (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="flex-1 flex flex-col justify-end items-center gap-6">
              <Image src={LockedIcon} alt="locked" width={300} />
              <div className="flex flex-col gap-2 text-center">
                <h2 className="text-3xl font-bold text-gray-900">
                  Locked, and loaded.
                </h2>
                <p className="text-base text-gray-600 max-w-sm">
                  Your rewards are flowing and your vote just got stronger!
                </p>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-end items-center gap-4 w-full">
              <UpdatedButton
                onClick={handleLockMore}
                type="secondary"
                className="w-full"
                variant="rounded"
              >
                Lock More Funds
              </UpdatedButton>
              <UpdatedButton
                type="primary"
                className="w-full"
                onClick={handleViewDashboard}
                variant="rounded"
              >
                View Dashboard
              </UpdatedButton>
            </div>
          </div>
        );
      }

      return (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div className="flex-1 flex flex-col justify-end items-center gap-6">
            <Image src={LockClosedIcon} alt="coin" width={300} />
            <div className="flex flex-col">
              <p className="text-md text-[#9D9FA1] text-center">
                Successfully locked {selectedToken?.metadata?.name}
              </p>
              <div className="text-4xl font-bold text-gray-900 text-center">
                <TokenAmount
                  amount={parseNearAmount(enteredAmount) ?? "0"}
                  minimumFractionDigits={4}
                  currency={selectedToken?.metadata?.symbol}
                />
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-end items-center gap-4 w-full">
            <UpdatedButton
              onClick={handleLockMore}
              type="secondary"
              className="w-full"
              variant="rounded"
            >
              Lock More Funds
            </UpdatedButton>
            {hasStakeableAfterLock ? (
              <UpdatedButton
                type="primary"
                className="w-full"
                onClick={handleProceedToStaking}
                variant="rounded"
              >
                Next
              </UpdatedButton>
            ) : (
              <UpdatedButton
                type="primary"
                className="w-full"
                onClick={handleViewDashboard}
                variant="rounded"
              >
                View Dashboard
              </UpdatedButton>
            )}
          </div>
        </div>
      );
    }

    if (isSubmitting) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div className="flex-1 flex flex-col justify-end items-center gap-6">
            <Image src={LockOpenIcon} alt="coin" width={300} height={300} />
            <div className="flex flex-col">
              <p className="text-md text-[#9D9FA1] text-center">
                {isFireblocksWallet && transactionText
                  ? transactionText
                  : `Locking ${selectedToken?.metadata?.name}...`}
              </p>
              <div className="text-4xl font-bold text-gray-900 text-center">
                <TokenAmount
                  amount={parseNearAmount(enteredAmount) ?? "0"}
                  minimumFractionDigits={4}
                  currency={selectedToken?.metadata?.symbol}
                />
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-end w-full items-center gap-4 pb-4">
            <div className="bg-neutral w-full border border-line rounded-xl overflow-hidden flex items-center shadow-sm">
              <div className="flex items-center justify-center bg-[#9797FF]/30 gap-3 w-[40px] h-[40px]">
                <InformationCircleIcon className="w-5 h-5 text-[#9797FF]" />
              </div>
              <div className="flex flex-row w-full justify-center items-center gap-2">
                <span className="text-sm font-medium">
                  {isFireblocksWallet && numTransactions > 0
                    ? `Pending ${transactionStep + 1} of ${numTransactions} wallet signatures`
                    : "Pending wallet signature"}
                </span>
                <TooltipWithTap
                  content={
                    <div className="max-w-[300px] flex flex-col text-left p-3">
                      <h4 className="text-lg font-bold mb-2">
                        {isFireblocksWallet && numTransactions > 0
                          ? "You'll need to complete a few wallet signatures to complete setup."
                          : "You'll need to sign several transactions to complete the lockup process."}
                      </h4>
                      <p className="text-sm">
                        Depending on what you&apos;re locking, this may include:
                      </p>
                      <div className="border-b border-line my-2" />
                      <ul className="text-md space-y-1 font-bold list-disc pl-4">
                        <li>Deploying your lockup contract (one-time)</li>
                        <li>Transferring tokens</li>
                        <li>Locking your assets</li>
                      </ul>
                    </div>
                  }
                >
                  <InformationCircleIcon className="w-4 h-4 text-[#9D9FA1]" />
                </TooltipWithTap>
              </div>
            </div>
            <UpdatedButton
              type="secondary"
              className="w-full"
              variant="rounded"
            >
              <div className="flex items-center justify-center w-full">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
              </div>
            </UpdatedButton>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <TransactionError
          message={error || "Unknown error"}
          onRetry={
            isFireblocksWallet ? retryFromCurrentStep : executeTransactions
          }
          onGoBack={handleEdit}
        />
      );
    }

    return (
      <div className="flex flex-col gap-6 w-full h-full">
        <div className="flex justify-start">
          <button
            onClick={handleEdit}
            className="flex items-center justify-center w-10 h-10 bg-black rounded-full text-white hover:bg-gray-800 transition-colors"
            aria-label="Go back to edit"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
          </button>
        </div>
        <div className="flex flex-col text-sm border-b border-line">
          <div className="flex flex-row justify-between items-start py-4">
            <div className="flex flex-col">
              <span className="font-bold text-primary">Amount to Lock</span>
              <span className="text-secondary text-xs">
                {annualAPY}% Voting Power Growth
              </span>
              {selectedToken?.type === "lst" && lstPriceYocto && (
                <span className="text-secondary text-xs">
                  {(() => {
                    const nearPerLst = formatNearAmount(
                      lstPriceYocto ?? "0",
                      4
                    );
                    return `1 ${selectedToken?.metadata?.symbol} ≈ ${nearPerLst} NEAR`;
                  })()}
                </span>
              )}
            </div>
            <TokenAmount
              amount={parseNearAmount(enteredAmount) ?? "0"}
              minimumFractionDigits={4}
              currency={selectedToken?.metadata?.symbol}
              className="font-bold"
            />
          </div>
          {Big(depositTotal).gt(0) && (
            <>
              <div className="border-t border-line"></div>
              <div className="flex flex-row justify-between items-center py-4">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-primary">Deposit fees</span>
                  <DepositTooltip
                    totalDeposit={depositTotal}
                    title="Deposit Fee Breakdown"
                    subtitle="To participate in voting, there are two deposits required."
                    lineItems={[
                      {
                        amount: venearStorageCost,
                        title: "Account Deposit",
                        description:
                          "This covers your account storage in the veNEAR contract. This amount is locked immediately and cannot be withdrawn.",
                      },
                      {
                        amount: lockupStorageCost,
                        title: "Lockup Deposit",
                        description:
                          "This covers your lockup contract's deployment and storage costs. This is refundable, and can be locked but cannot be staked.",
                      },
                    ]}
                  />
                </div>
                <TokenAmount
                  amount={depositTotal ?? "0"}
                  minimumFractionDigits={4}
                  className="font-bold"
                />
              </div>
            </>
          )}
          {customStakingPoolId && (
            <>
              <div className="border-t border-line"></div>
              <div className="flex flex-row justify-between items-center py-4">
                <span className="font-bold text-primary">Staking Pool</span>
                <span className="font-medium text-sm text-gray-900">
                  {customStakingPoolId}
                </span>
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span>Total est. veNEAR</span>
          {formattedVeNearAmount}
        </div>
        <div className="flex-1 flex flex-col justify-end pb-4">
          {shouldShowLSTWarning && (
            <LiquidStakingTokenLockWarning
              symbol={selectedToken?.metadata?.name}
            />
          )}
          <div className="flex flex-col gap-2">
            <UpdatedButton
              type="primary"
              onClick={handleTransactionInit}
              disabled={
                !enteredAmount ||
                enteredAmount === "0" ||
                !lockupAccountId ||
                isLoading
              }
              className="w-full mt-4"
              variant="rounded"
            >
              Lock tokens
            </UpdatedButton>
            <p className="text-xs text-secondary text-center text-[#9D9FA1]">
              You may unlock your tokens at any time.{" "}
              <button
                className="underline text-primary hover:text-primary/80"
                onClick={handleShowDisclosures}
              >
                Disclosures
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }
);

ReviewStep.displayName = "ReviewStep";
