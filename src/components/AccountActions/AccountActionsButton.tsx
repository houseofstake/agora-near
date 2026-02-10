import { useNear } from "@/contexts/NearContext";
import Link from "next/link";
import { memo, useCallback } from "react";
import { useOpenDialog } from "../Dialogs/DialogProvider/DialogProvider";
import { UpdatedButton } from "../Button";
import { useVenearAccountInfo } from "@/hooks/useVenearAccountInfo";
import { useDelegateProfile } from "@/hooks/useDelegateProfile";
import { useAnalytics } from "@/hooks/useAnalytics";
import Big from "big.js";

type AccountActionsProps = {
  close: () => void;
};

export const AccountActions = memo(({ close }: AccountActionsProps) => {
  const { signedAccountId, isInitialized } = useNear();
  const openDialog = useOpenDialog();
  const { data: accountInfo, isLoading: isLoadingVenearAccountInfo } =
    useVenearAccountInfo(signedAccountId);

  const { data: delegate, isLoading: isLoadingDelegateProfile } =
    useDelegateProfile({
      accountId: signedAccountId,
    });

  const { trackBecomeDelegateCtaClicked } = useAnalytics();

  const hasStatement = !!delegate?.statement;
  const currentDelegatee = accountInfo?.delegation?.delegatee;
  const hasActiveDelegation = !!currentDelegatee;

  const isLoading =
    isLoadingVenearAccountInfo || !isInitialized || isLoadingDelegateProfile;

  const onLockAndStakePress = useCallback(() => {
    close();
    openDialog({
      type: "NEAR_LOCK",
      params: {
        source: accountInfo ? "account_management" : "onboarding",
      },
    });
  }, [accountInfo, close, openDialog]);

  const onChangeDelegatePress = useCallback(() => {
    close();
    if (hasActiveDelegation && currentDelegatee) {
      openDialog({
        type: "NEAR_UNDELEGATE",
        params: {
          delegateAddress: currentDelegatee,
        },
      });
    } else {
      window.location.href = "/delegates";
    }
  }, [close, hasActiveDelegation, currentDelegatee, openDialog]);

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <div className="self-stretch h-12 pl-6 flex items-center animate-pulse bg-tertiary/10 rounded-lg"></div>
        <div className="self-stretch h-12 pl-6 flex items-center animate-pulse bg-tertiary/10 rounded-lg mt-2"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <UpdatedButton
          onClick={onLockAndStakePress}
          className="w-full"
          variant="rounded"
        >
          Lock & Stake
        </UpdatedButton>
      </div>
      <div className="mb-4">
        <UpdatedButton
          onClick={onChangeDelegatePress}
          className="w-full"
          type="secondary"
          variant="rounded"
        >
          {hasActiveDelegation ? "Undelegate" : "Choose a delegate"}
        </UpdatedButton>
      </div>
      <div className="border-b border-line -mx-6 mb-4"></div>
      <Link
        href={`/delegates/${signedAccountId}`}
        onClick={close}
        className="self-stretch h-12 pl-4 text-secondary flex items-center hover:bg-neutral hover:font-bold hover:rounded-md"
      >
        View my profile
      </Link>
      <Link
        href={`/delegates/create`}
        onClick={() => {
          close();
          if (!hasStatement) {
            const totalBalance = accountInfo
              ? Big(accountInfo.totalBalance.near || "0")
                  .plus(accountInfo.totalBalance.extraBalance || "0")
                  .toString()
              : "0";
            trackBecomeDelegateCtaClicked({
              user_venear_balance: totalBalance,
              has_existing_statement: false,
            });
          }
        }}
        className="self-stretch h-12 pl-4 text-secondary flex items-center hover:bg-neutral hover:font-bold hover:rounded-md"
      >
        {hasStatement ? "Edit delegate statement" : "Create delegate statement"}
      </Link>
    </div>
  );
});

AccountActions.displayName = "AccountActions";
