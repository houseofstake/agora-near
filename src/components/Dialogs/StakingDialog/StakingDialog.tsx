import LoadingSpinner from "@/components/shared/LoadingSpinner";
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
};

type DialogStep = "form" | "review";

const StakingDialogContent = ({ closeDialog }: { closeDialog: () => void }) => {
  const { isLoading, setSelectedPool, source, maxStakingAmount } =
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
  };

  const handleBack = () => {
    setCurrentStep("form");
  };

  const handleSkip = useCallback(() => {
    trackStakingSkipped({
      lockup_balance_near: maxStakingAmount
        ? convertYoctoToNear(maxStakingAmount)
        : undefined,
    });
    goToDashboard();
  }, [trackStakingSkipped, maxStakingAmount, goToDashboard]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (currentStep === "review") {
    return (
      <StakingReview onBack={handleBack} handleViewDashboard={goToDashboard} />
    );
  }

  return <EnterStakingAmount onContinue={handleContinue} onSkip={handleSkip} />;
};

export const StakingDialog = ({ closeDialog, source }: StakingDialogProps) => {
  return (
    <StakingProvider source={source}>
      <div className="flex flex-col items-center h-[600px] px-2">
        <StakingDialogContent closeDialog={closeDialog} />
      </div>
    </StakingProvider>
  );
};
