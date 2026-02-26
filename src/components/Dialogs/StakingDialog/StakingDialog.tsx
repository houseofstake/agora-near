import { READ_NEAR_CONTRACT_QK } from "@/hooks/useReadHOSContract";
import { CONTRACTS } from "@/lib/contractConstants";
import { StakingPool } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { StakingProvider, useStakingProviderContext } from "../StakingProvider";
import { EnterStakingAmount } from "./EnterStakingAmount";
import { StakingReview } from "./StakingReview";
import { useAnalytics } from "@/hooks/useAnalytics";
import { convertYoctoToNear } from "@/lib/utils";

export type StakingSource =
  | "onboarding"
  | "account_management"
  | "claim_rewards";

type StakingDialogProps = {
  closeDialog: () => void;
  source: StakingSource;
  onStepChange?: (step: string) => void;
};

type DialogStep = "form" | "review";

const StakingDialogContent = ({
  closeDialog,
  onStepChange,
}: {
  closeDialog: () => void;
  onStepChange?: (step: string) => void;
}) => {
  const { setSelectedPool, source, maxStakingAmount } =
    useStakingProviderContext();
  const [currentStep, setCurrentStep] = useState<DialogStep>("form");
  const { trackStakingFlowStarted, trackStakingSkipped } = useAnalytics();

  useEffect(() => {
    trackStakingFlowStarted({
      source,
      lockup_balance_near: maxStakingAmount
        ? convertYoctoToNear(maxStakingAmount)
        : undefined,
    });
  }, [source, maxStakingAmount, trackStakingFlowStarted]);

  const queryClient = useQueryClient();

  const router = useRouter();

  const goToDashboard = useCallback(() => {
    closeDialog();
    queryClient.invalidateQueries({
      queryKey: [READ_NEAR_CONTRACT_QK, CONTRACTS.VENEAR_CONTRACT_ID],
    });
    router.push("/assets");
  }, [closeDialog, queryClient, router]);

  const handleContinue = (pool: StakingPool) => {
    setSelectedPool(pool);
    setCurrentStep("review");
    onStepChange?.("review");
  };

  const handleBack = () => {
    setCurrentStep("form");
    onStepChange?.("pool_selection");
  };

  const handleSkip = useCallback(() => {
    trackStakingSkipped({
      lockup_balance_near: maxStakingAmount
        ? convertYoctoToNear(maxStakingAmount)
        : undefined,
    });
    goToDashboard();
  }, [trackStakingSkipped, maxStakingAmount, goToDashboard]);

  // Track dialog close if not completed
  useEffect(() => {
    return () => {
      // If the component unmounts and we're not navigating away or finished
      // This is a best-effort approximation since we don't have a definitive "success" state in this component's scope easily accessible without refactoring
      // However, typical closeDialog usage unmounts this.
      // We will track it when the parent closes it essentially.
    };
  }, []);

  return currentStep === "review" ? (
    <StakingReview onBack={handleBack} handleViewDashboard={goToDashboard} />
  ) : (
    <EnterStakingAmount onContinue={handleContinue} onSkip={handleSkip} />
  );
};

export const StakingDialog = ({
  closeDialog,
  source,
  onStepChange,
}: StakingDialogProps) => {
  const { trackStakingDialogClosed } = useAnalytics();
  const [startTime] = useState(Date.now());

  const handleClose = useCallback(() => {
    trackStakingDialogClosed({
      step_abandoned: "unknown",
      time_in_flow_ms: Date.now() - startTime,
    });
    closeDialog();
  }, [closeDialog, startTime, trackStakingDialogClosed]);

  return (
    <StakingProvider source={source}>
      <div className="flex flex-col items-center h-[600px] px-2">
        <StakingDialogContent
          closeDialog={handleClose}
          onStepChange={onStepChange}
        />
      </div>
    </StakingProvider>
  );
};
