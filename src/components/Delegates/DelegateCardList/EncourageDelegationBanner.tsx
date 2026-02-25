import { useMemo } from "react";
import { ExclamationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { UpdatedButton } from "@/components/Button";
import { useNear } from "@/contexts/NearContext";
import { useVenearAccountInfo } from "@/hooks/useVenearAccountInfo";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import Big from "big.js";
import Link from "next/link";

const DISMISSED_BANNER_KEY = "agora-delegation-encouragement-dismissed";

export const EncourageDelegationBanner = ({
  filterParam,
}: {
  filterParam: string | null;
}) => {
  const { signedAccountId } = useNear();
  const { data: accountInfo } = useVenearAccountInfo(signedAccountId);
  const [isDismissed, setIsDismissed] = useLocalStorage(
    DISMISSED_BANNER_KEY,
    false
  );

  const shouldShowBanner = useMemo(() => {
    if (!accountInfo || !signedAccountId) return false;

    // Don't show banner if already viewing endorsed delegates
    if (filterParam === "endorsed") return false;

    // Check if user has any tokens (total balance > 0)
    const totalBalance = Big(accountInfo.totalBalance.near || "0").plus(
      accountInfo.totalBalance.extraBalance || "0"
    );

    // Check if user has delegated
    const delegatee = accountInfo.delegation?.delegatee;
    const hasDelegated = !!delegatee;
    const isDelegatedToSelf = delegatee === signedAccountId;

    // Show banner if user has tokens and (hasn't delegated OR is delegated to themselves)
    return totalBalance.gt(0) && (!hasDelegated || isDelegatedToSelf);
  }, [accountInfo, signedAccountId, filterParam]);

  if (!shouldShowBanner || !signedAccountId || isDismissed) {
    return null;
  }

  return (
    <div className="w-full rounded-lg border border-negative mt-3 mb-1 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1 flex items-start gap-2 text-primary min-w-0">
          <ExclamationCircleIcon className="w-6 h-6 stroke-negative flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 flex-1">
            <div className="text-base font-bold leading-normal">
              Vote through endorsed delegates!
            </div>
            <div className="text-sm font-medium leading-[21px]">
              Make your vote count by delegating to trusted community members.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-shrink-0">
          <Link
            href="/delegates?filter=endorsed"
            className="flex-1 sm:flex-initial"
          >
            <UpdatedButton
              type="primary"
              className="font-medium px-[20px] py-3 w-full sm:w-auto whitespace-nowrap"
            >
              View endorsed delegates
            </UpdatedButton>
          </Link>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:bg-tertiary/10 rounded-md transition-colors flex-shrink-0"
            aria-label="Dismiss banner"
          >
            <XMarkIcon className="w-5 h-5 stroke-secondary" />
          </button>
        </div>
      </div>
    </div>
  );
};
