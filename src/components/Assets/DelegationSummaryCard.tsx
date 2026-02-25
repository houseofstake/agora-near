"use client";

import { memo, useCallback, useState } from "react";
import { useNear } from "@/contexts/NearContext";
import { useVenearAccountInfo } from "@/hooks/useVenearAccountInfo";
import { UpdatedButton } from "../Button";
import { useOpenDialog } from "../Dialogs/DialogProvider/DialogProvider";
import { XMarkIcon } from "@heroicons/react/24/outline";

export const DelegationSummaryCard = memo(() => {
  const { signedAccountId } = useNear();
  const { data: accountInfo } = useVenearAccountInfo(signedAccountId);
  const openDialog = useOpenDialog();
  const [isDismissed, setIsDismissed] = useState(false);

  const delegatee = accountInfo?.delegation?.delegatee;
  const hasActiveDelegation = !!delegatee;

  const handleUndelegate = useCallback(() => {
    if (!delegatee) return;
    openDialog({
      type: "NEAR_UNDELEGATE",
      params: { delegateAddress: delegatee },
    });
  }, [delegatee, openDialog]);

  const handleChooseDelegate = useCallback(() => {
    window.location.href = "/delegates";
  }, []);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
  }, []);

  if (!accountInfo || isDismissed) return null;

  return (
    <div className="bg-neutral rounded-2xl border border-line p-6 w-full relative">
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1 hover:bg-wash rounded-full transition-colors"
        aria-label="Dismiss card"
      >
        <XMarkIcon className="w-5 h-5 text-tertiary hover:text-secondary" />
      </button>
      <div className="flex items-start justify-between gap-4 pr-8">
        <div className="flex flex-col">
          <div className="text-sm text-secondary mb-1">Delegation</div>
          <div className="text-xl text-primary font-medium">
            {hasActiveDelegation ? (
              <span
                title={delegatee!}
                className="truncate max-w-[280px] inline-block"
              >
                Delegated to {delegatee}
              </span>
            ) : (
              <span>Not delegated</span>
            )}
          </div>
        </div>
        <div className="flex flex-row gap-2">
          {hasActiveDelegation ? (
            <UpdatedButton type="secondary" onClick={handleUndelegate}>
              Undelegate
            </UpdatedButton>
          ) : (
            <UpdatedButton type="primary" onClick={handleChooseDelegate}>
              Choose a delegate
            </UpdatedButton>
          )}
        </div>
      </div>
    </div>
  );
});

DelegationSummaryCard.displayName = "DelegationSummaryCard";
