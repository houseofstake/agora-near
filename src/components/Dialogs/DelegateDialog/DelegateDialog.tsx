import { UpdatedButton } from "@/components/Button";
import { useNear } from "@/contexts/NearContext";
import { useDelegateAll } from "@/hooks/useDelegateAll";
import { useVenearAccountInfo } from "@/hooks/useVenearAccountInfo";

import { ArrowDownIcon } from "@heroicons/react/20/solid";
import { useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import Big from "big.js";
import { useAnalytics } from "@/hooks/useAnalytics";

export function DelegateDialog({
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

  const { trackDelegationStarted, trackDelegationSuccess, trackDelegationFailed } =
    useAnalytics();

  const { delegateAll, isDelegating, error } = useDelegateAll({
    onSuccess: () => {
      trackDelegationSuccess({
        delegate_address: delegateAddress,
        voting_power_yocto: delegatableVotingPower.toFixed(0),
      });
      toast.success("Delegation completed!");
      closeDialog();
    },
    delegateVotingPower: delegatableVotingPower,
    currentDelegateeAddress: accountInfo?.delegation?.delegatee,
  });

  useEffect(() => {
    if (error) {
      trackDelegationFailed({
        delegate_address: delegateAddress,
        error_type: "contract_error",
        error_message: (error as any)?.message || "Unknown error",
      });
    }
  }, [error, delegateAddress, trackDelegationFailed]);

  useEffect(() => {
    trackDelegationStarted({
      delegate_address: delegateAddress,
      current_delegate: accountInfo?.delegation?.delegatee,
      voting_power_yocto: delegatableVotingPower.toFixed(0),
    });
  }, [delegateAddress, accountInfo?.delegation?.delegatee, delegatableVotingPower, trackDelegationStarted]);

  const handleDelegate = useCallback(() => {
    delegateAll(delegateAddress);
  }, [delegateAll, delegateAddress]);

  return (
    <div className="flex flex-col items-center w-full bg-neutral max-w-[28rem]">
      <div className="flex flex-col items-center w-full bg-neutral max-w-[28rem]">
        <div className="flex flex-col gap-6 justify-center min-h-[318px] w-full">
          <div className="flex flex-col gap-4">
            <p className="text-xl font-bold text-left text-primary">
              Set{" "}
              <span className="truncate max-w-[120px]" title={delegateAddress}>
                {delegateAddress}
              </span>{" "}
              as your delegate
            </p>
            <div className="text-secondary">
              <span className="truncate max-w-[120px]" title={delegateAddress}>
                {delegateAddress}
              </span>{" "}
              will be able to vote with any token owned by your address
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
                    Delegating to
                  </p>
                  <div className="font-medium text-primary max-w-[6rem] sm:max-w-full">
                    <span
                      className="truncate max-w-[120px]"
                      title={delegateAddress}
                    >
                      {delegateAddress}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <UpdatedButton
              type={isDelegating || error ? "secondary" : "primary"}
              onClick={handleDelegate}
              disabled={isDelegating}
            >
              {isDelegating
                ? "Submitting your delegation..."
                : error
                  ? "Delegation failed - try again"
                  : "Delegate"}
            </UpdatedButton>
          </div>
        </div>
      </div>
    </div>
  );
}
