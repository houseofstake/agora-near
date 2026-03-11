"use client";

import { memo, useCallback, useState } from "react";
import Link from "next/link";
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

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
  }, []);

  if (!accountInfo || isDismissed) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 w-full relative">
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Dismiss card"
      >
        <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
      </button>
      <div className="flex items-start justify-between gap-4 pr-8 min-w-0">
        <div className="flex flex-col min-w-0 flex-1">
          <div className="text-sm text-gray-600 mb-1">Delegation</div>
          <div className="text-xl text-gray-900 font-medium">
            {hasActiveDelegation ? (
              <span title={delegatee!}>Delegated to {delegatee}</span>
            ) : (
              <span>Not delegated</span>
            )}
          </div>
        </div>
        <div className="flex flex-row gap-2 flex-shrink-0">
          {hasActiveDelegation ? (
            <>
              <Link href="/delegates">
                <UpdatedButton type="secondary">
                  Change Delegation
                </UpdatedButton>
              </Link>
              <UpdatedButton type="secondary" onClick={handleUndelegate}>
                Undelegate
              </UpdatedButton>
            </>
          ) : (
            <Link href="/delegates">
              <UpdatedButton type="primary">Choose a delegate</UpdatedButton>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
});

DelegationSummaryCard.displayName = "DelegationSummaryCard";
