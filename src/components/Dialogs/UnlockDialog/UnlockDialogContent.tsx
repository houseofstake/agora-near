import { READ_NEAR_CONTRACT_QK } from "@/hooks/useReadHOSContract";
import { CONTRACTS } from "@/lib/contractConstants";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import LoadingSpinner from "../../shared/LoadingSpinner";
import { useUnlockProviderContext } from "../UnlockProvider";
import { EnterAmountStep } from "./EnterAmountStep";
import { ReviewStep } from "./ReviewStep";

type DialogContentProps = {
  closeDialog: () => void;
};

import { useAnalytics } from "@/hooks/useAnalytics";
import Big from "big.js";
import { useEffect, useRef } from "react";

export function UnlockDialogContent({ closeDialog }: DialogContentProps) {
  const { isLoading, lockupAccountId, maxAmountToUnlock, unlockDurationNs } =
    useUnlockProviderContext();
  const { trackUnlockFlowStarted, trackUnlockDialogClosed } = useAnalytics();
  const startTime = useRef(Date.now());
  const currentStepRef = useRef(1);

  useEffect(() => {
    const startTimeMs = startTime.current;

    const durationDays = Big(unlockDurationNs)
      .div(Big(10).pow(9).times(60).times(60).times(24))
      .toNumber();

    trackUnlockFlowStarted({
      lockup_id: lockupAccountId ?? "unknown",
      locked_amount_yocto: maxAmountToUnlock ?? "0",
      lock_duration_remaining_days: Math.round(durationDays),
    });

    return () => {
      const timeSpent = Date.now() - startTimeMs;
      let stepName = "unknown";
      if (currentStepRef.current === 1) stepName = "amount_selection";
      if (currentStepRef.current === 2) stepName = "review";

      trackUnlockDialogClosed({
        step_abandoned: stepName,
        time_in_flow_ms: timeSpent,
      });
    };
  }, [
    lockupAccountId,
    maxAmountToUnlock,
    unlockDurationNs,
    trackUnlockFlowStarted,
    trackUnlockDialogClosed,
  ]);

  const router = useRouter();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);

  const handleReview = useCallback(() => {
    setCurrentStep(2);
    currentStepRef.current = 2;
  }, []);

  const handleEdit = useCallback(() => {
    setCurrentStep(1);
    currentStepRef.current = 1;
  }, []);

  const handleViewDashboard = useCallback(() => {
    closeDialog();
    queryClient.invalidateQueries({
      queryKey: [READ_NEAR_CONTRACT_QK, CONTRACTS.VENEAR_CONTRACT_ID],
    });
    router.push("/assets");
  }, [closeDialog, queryClient, router]);

  const content = useMemo(() => {
    if (currentStep === 1) {
      return (
        <div className="flex flex-col gap-2 h-full">
          <EnterAmountStep handleReview={handleReview} />
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <ReviewStep
          handleEdit={handleEdit}
          handleViewDashboard={handleViewDashboard}
        />
      );
    }

    return null;
  }, [currentStep, handleEdit, handleReview, handleViewDashboard]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[600px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full pt-4 px-2 h-[600px]">
      {content}
    </div>
  );
}
