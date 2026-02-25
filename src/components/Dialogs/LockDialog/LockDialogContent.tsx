import { READ_NEAR_CONTRACT_QK } from "@/hooks/useReadHOSContract";
import { CONTRACTS } from "@/lib/contractConstants";
import { TokenWithBalance } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import Big from "big.js";
import LoadingSpinner from "../../shared/LoadingSpinner";
import { useOpenDialog } from "../DialogProvider/DialogProvider";
import { useLockProviderContext } from "../LockProvider";
import { AssetSelector } from "./AssetSelector";
import { EnterAmountStep } from "./EnterAmountStep";
import { LockDialogHeader } from "./LockDialogHeader";
import { ReviewStep } from "./ReviewStep";
import { SwitchPoolDialog } from "./SwitchPoolDialog";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useNear } from "@/contexts/NearContext";
import { useEffect, useRef } from "react";

type DialogContentProps = {
  closeDialog: () => void;
};

export function LockDialogContent({ closeDialog }: DialogContentProps) {
  const {
    setSelectedToken,
    isLoading,
    resetForm,
    source,
    lockupAccountId,
    availableTokens,
  } = useLockProviderContext();
  const { trackLockDialogOpened, trackLockDialogClosed } = useAnalytics();
  const { getBalance, signedAccountId } = useNear();
  const startTime = useRef(Date.now());
  const currentStepRef = useRef(1);

  useEffect(() => {
    const startTimeMs = startTime.current;
    const fetchBalanceAndTrack = async () => {
      let nearBalance = "0";
      if (signedAccountId) {
        nearBalance = await getBalance(signedAccountId);
      }

      const totalLstBalance = availableTokens
        .filter((t) => t.type === "lst")
        .reduce((acc, t) => acc.plus(Big(t.balance)), Big(0))
        .toFixed();

      trackLockDialogOpened({
        source,
        user_near_balance_yocto: nearBalance,
        user_lst_balance_yocto: totalLstBalance,
        has_existing_lockup: !!lockupAccountId,
      });
    };
    fetchBalanceAndTrack();

    return () => {
      const timeSpent = Date.now() - startTimeMs;
      let stepName = "unknown";
      if (currentStepRef.current === 1) stepName = "amount_selection";
      if (currentStepRef.current === 2) stepName = "review";

      trackLockDialogClosed({
        step_abandoned: stepName,
        time_in_flow_ms: timeSpent,
      });
    };
  }, [
    source,
    signedAccountId,
    getBalance,
    trackLockDialogOpened,
    trackLockDialogClosed,
    lockupAccountId,
    availableTokens,
  ]);

  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [isAssetSelectorOpen, setIsAssetSelectorOpen] = useState(false);
  const [isSwitchPoolOpen, setIsSwitchPoolOpen] = useState(false);

  const openDialog = useOpenDialog();

  const queryClient = useQueryClient();

  const handleReview = () => {
    setCurrentStep(2);
    currentStepRef.current = 2;
  };

  const handleEdit = () => {
    setCurrentStep(1);
    currentStepRef.current = 1;
  };

  const handleLockMore = () => {
    setCurrentStep(1);
    currentStepRef.current = 1;
  };

  const openAssetSelector = useCallback(() => {
    setIsAssetSelectorOpen(true);
  }, []);

  const closeAssetSelector = useCallback(
    () => setIsAssetSelectorOpen(false),
    []
  );

  const handleTokenSelect = useCallback(
    (token: TokenWithBalance) => {
      setSelectedToken(token);
      resetForm();
      closeAssetSelector();
    },
    [setSelectedToken, resetForm, closeAssetSelector]
  );

  const proceedToStaking = useCallback(() => {
    closeDialog();
    openDialog({
      type: "NEAR_STAKING",
      className: "sm:w-[500px]",
      params: {
        source,
      },
    });
  }, [closeDialog, openDialog, source]);

  const handleViewDashboard = useCallback(() => {
    closeDialog();
    queryClient.invalidateQueries({
      queryKey: [READ_NEAR_CONTRACT_QK, CONTRACTS.VENEAR_CONTRACT_ID],
    });
    router.push("/assets");
  }, [closeDialog, queryClient, router]);

  const content = useMemo(() => {
    if (isAssetSelectorOpen) {
      return (
        <AssetSelector
          handleTokenSelect={handleTokenSelect}
          onBack={closeAssetSelector}
        />
      );
    }

    if (isSwitchPoolOpen) {
      return (
        <SwitchPoolDialog
          onClose={() => setIsSwitchPoolOpen(false)}
          onSuccess={() => {
            // Re-fetch or advance logic if necessary, otherwise just return to amount step
          }}
        />
      );
    }

    if (currentStep === 1) {
      return (
        <div className="flex flex-col gap-2 h-full">
          <LockDialogHeader />
          <EnterAmountStep
            openAssetSelector={openAssetSelector}
            openSwitchPoolDialog={() => setIsSwitchPoolOpen(true)}
            handleReview={handleReview}
          />
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <ReviewStep
          handleEdit={handleEdit}
          handleLockMore={handleLockMore}
          handleProceedToStaking={proceedToStaking}
          handleViewDashboard={handleViewDashboard}
        />
      );
    }

    return null;
  }, [
    currentStep,
    handleTokenSelect,
    handleViewDashboard,
    isAssetSelectorOpen,
    openAssetSelector,
    proceedToStaking,
    closeAssetSelector,
    isSwitchPoolOpen,
  ]);

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
