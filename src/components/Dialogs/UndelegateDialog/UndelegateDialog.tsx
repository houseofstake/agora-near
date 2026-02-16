import { UpdatedButton } from "@/components/Button";
import { useNear } from "@/contexts/NearContext";
import { useUndelegate } from "@/hooks/useUndelegate";
import { useVenearAccountInfo } from "@/hooks/useVenearAccountInfo";

import { ArrowDownIcon } from "@heroicons/react/20/solid";
import { useCallback } from "react";
import toast from "react-hot-toast";
import Big from "big.js";

export function UndelegateDialog({
  delegateAddress,
  closeDialog,
}: {
  delegateAddress: string;
  closeDialog: () => void;
}) {
  const { signedAccountId } = useNear();
  const { data: accountInfo } = useVenearAccountInfo(signedAccountId);

  const delegatableVotingPower = Big(
    accountInfo?.totalBalance?.near || "0"
  ).plus(accountInfo?.totalBalance?.extraBalance || "0");

  const { undelegate, isUndelegating, error } = useUndelegate({
    onSuccess: () => {
      toast.success("Undelegation completed!");
      closeDialog();
    },
    delegateVotingPower: delegatableVotingPower,
    delegateeAddress: delegateAddress,
  });

  const handleUndelegate = useCallback(() => {
    undelegate();
  }, [undelegate]);

  return (
    <div className="flex flex-col items-center w-full bg-neutral max-w-[28rem]">
      <div className="flex flex-col items-center w-full bg-neutral max-w-[28rem]">
        <div className="flex flex-col gap-6 justify-center min-h-[318px] w-full">
          <div className="flex flex-col gap-4">
            <p className="text-xl font-bold text-left text-primary">
              Remove{" "}
              <span className="truncate max-w-[120px]" title={delegateAddress}>
                {delegateAddress}
              </span>{" "}
              as your delegate
            </p>
            <div className="text-secondary">
              This delegate will no longer be able to vote on your behalf. Your
              voting power returns to your direct control. Note: The delegate
              will retain your voting power on any active proposals approved by
              the Screening Committee before you undelegated.
            </div>
            <div className="flex flex-col relative border border-line rounded-lg">
              <div className="flex flex-row items-center gap-3 p-2 border-b border-line">
                <div className="flex flex-col">
                  <p className="text-xs font-medium text-secondary">
                    Currently delegated to
                  </p>
                  <div className="font-medium text-primary max-w-[6rem] sm:max-w-full">
                    <p>
                      {accountInfo?.delegation?.delegatee ? (
                        <span
                          className="truncate max-w-[120px]"
                          title={accountInfo.delegation.delegatee}
                        >
                          {accountInfo.delegation.delegatee}
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-10 h-10 flex items-center justify-center bg-neutral border border-line rounded-full absolute right-4 top-[50%] translate-y-[-50%]">
                <ArrowDownIcon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-row gap-3 items-center p-2">
                <div className="flex flex-col">
                  <p className="text-xs font-medium text-secondary">
                    Remove your delegate votes
                  </p>
                  <div className="font-medium text-primary max-w-[6rem] sm:max-w-full">
                    -
                  </div>
                </div>
              </div>
            </div>
            <UpdatedButton
              type={isUndelegating || error ? "secondary" : "primary"}
              onClick={handleUndelegate}
              disabled={isUndelegating}
            >
              {isUndelegating
                ? "Submitting your undelegation request..."
                : error
                  ? "Undelegation failed - try again"
                  : "Undelegate"}
            </UpdatedButton>
          </div>
        </div>
      </div>
    </div>
  );
}
