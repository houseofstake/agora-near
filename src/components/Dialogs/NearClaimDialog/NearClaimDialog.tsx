import { useNearClaimProofs } from "@/hooks/useNearClaimProofs";
import { useNear } from "@/contexts/NearContext";
import { UpdatedButton } from "@/components/Button";
import { CheckIcon, StarIcon } from "@heroicons/react/24/solid";
import { useState, useMemo, useEffect, useRef } from "react";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { useClaimNearRewards } from "@/hooks/useClaimNearRewards";
import toast from "react-hot-toast";
import { convertYoctoToNear } from "@/lib/utils";
import { NEAR_TOKEN_METADATA } from "@/lib/constants";
import { AssetIcon } from "@/components/common/AssetIcon";
import { useCheckClaimStatus } from "@/hooks/useCheckClaimStatus";
import { useMarkProofAsClaimed } from "@/hooks/useMarkProofAsClaimed";

interface NearClaimDialogProps {
  closeDialog: () => void;
}

export function NearClaimDialog({ closeDialog }: NearClaimDialogProps) {
  const { signedAccountId } = useNear();
  const { unclaimedProofs, refetch } = useNearClaimProofs(signedAccountId);
  const [currentStep, setCurrentStep] = useState<
    "initial" | "processing" | "success"
  >("initial");
  const [claimedAmount, setClaimedAmount] = useState<string>("0");

  const { batchClaimRewards, isClaiming } = useClaimNearRewards({
    onSuccess: () => {
      setCurrentStep("success");
      refetch();
    },
  });

  const { markProofAsClaimed } = useMarkProofAsClaimed();

  const syncedCampaignIds = useRef(new Set<number>());

  const campaignIds = useMemo(
    () => [...new Set(unclaimedProofs.map((proof) => Number(proof.projectId)))],
    [unclaimedProofs]
  );

  const {
    claimStatusMap,
    allClaimed,
    isLoading: isCheckingStatus,
  } = useCheckClaimStatus({
    campaignIds,
    accountId: signedAccountId,
  });

  // Sync API state when contract shows claimed but API doesn't
  useEffect(() => {
    if (!signedAccountId || isCheckingStatus || !claimStatusMap.size) return;

    unclaimedProofs.forEach((proof) => {
      const campaignId = Number(proof.projectId);
      const isClaimedOnChain = claimStatusMap.get(campaignId);

      if (isClaimedOnChain && !syncedCampaignIds.current.has(campaignId)) {
        syncedCampaignIds.current.add(campaignId);

        markProofAsClaimed({
          campaignId,
          address: signedAccountId,
          txHash: "AcGDAPMyafLiCZUc8RiJXBG5THThWrQ5AZss95nBWm8B", // Use placeholder since we don't have the original tx hash
        }).catch((error) => {
          console.error(
            `Failed to sync proof for campaign ${campaignId}:`,
            error
          );
          syncedCampaignIds.current.delete(campaignId);
        });
      }
    });
  }, [
    unclaimedProofs,
    claimStatusMap,
    signedAccountId,
    isCheckingStatus,
    markProofAsClaimed,
  ]);

  const actuallyUnclaimedProofs = useMemo(
    () =>
      unclaimedProofs.filter(
        (proof) => !claimStatusMap.get(Number(proof.projectId))
      ),
    [unclaimedProofs, claimStatusMap]
  );

  const hasNoClaimableTokens =
    actuallyUnclaimedProofs.length === 0 || allClaimed;

  const handleClaim = async () => {
    const proofs = actuallyUnclaimedProofs;
    setCurrentStep("processing");

    try {
      const claims = proofs.map((proof) => {
        if (!proof.proofData?.proof) {
          throw new Error(`No merkle proof available`);
        }

        return {
          amount: proof.proofData?.amount,
          merkleProof: proof.proofData.proof,
          campaignId: proof.proofData.campaignId,
          lockupContract: proof.proofData.lockup,
        };
      });

      await batchClaimRewards({ claims });

      const totalClaimed = proofs.reduce(
        (sum, proof) => sum + BigInt(proof.amount),
        BigInt(0)
      );

      setClaimedAmount(totalClaimed.toString());
      toast.success(
        `Claimed ${convertYoctoToNear(totalClaimed.toString(), 2)} NEAR`
      );
    } catch (error) {
      console.error("Failed to claim rewards:", error);
      toast.error(
        `Failed to claim rewards: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      setCurrentStep("initial");
    }
  };

  const openDialog = useOpenDialog();

  const handleLockRewards = () => {
    closeDialog();
    // Open the Lock dialog with staking source
    openDialog({
      type: "NEAR_LOCK",
      params: {
        source: "claim_rewards",
      },
    });
  };

  if (currentStep === "processing") {
    return (
      <div className="flex flex-col items-center w-full bg-neutral max-w-[28rem]">
        <div className="flex flex-col gap-6 justify-center min-h-[300px] w-full items-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-xl font-bold text-primary mb-2">
              Processing Claims
            </h2>
            <p className="text-secondary text-sm">
              Please wait while we process your reward claims...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === "success") {
    return (
      <div className="flex flex-col items-center w-full bg-neutral max-w-[28rem] my-8">
        <div className="flex flex-col gap-6 justify-center min-h-[400px] w-full items-center">
          <div className="relative">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckIcon className="w-8 h-8 text-green-600" />
            </div>
            <div className="absolute -top-2 -left-2">
              <StarIcon className="w-6 h-6 text-green-400" />
            </div>
            <div className="absolute -top-2 -right-2">
              <StarIcon className="w-6 h-6 text-green-400" />
            </div>
            <div className="absolute -bottom-2 -left-2">
              <StarIcon className="w-4 h-4 text-green-300" />
            </div>
            <div className="absolute -bottom-2 -right-2">
              <StarIcon className="w-4 h-4 text-green-300" />
            </div>
          </div>

          <div className="text-center">
            <p className="text-secondary mb-2">You just claimed a reward of</p>
            <div className="text-3xl font-bold text-primary mb-1">
              {convertYoctoToNear(claimedAmount, 2)}
            </div>
            <div className="flex items-center justify-center gap-1 text-sm text-secondary">
              <AssetIcon
                icon={NEAR_TOKEN_METADATA.icon}
                name={NEAR_TOKEN_METADATA.name}
              />
              NEAR
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <UpdatedButton type="primary" onClick={handleLockRewards} fullWidth>
              Lock my rewards
            </UpdatedButton>
            <UpdatedButton type="secondary" onClick={closeDialog} fullWidth>
              Done
            </UpdatedButton>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total from actually unclaimed proofs
  const actualTotalAmount = actuallyUnclaimedProofs.reduce(
    (sum, proof) => (BigInt(sum) + BigInt(proof.amount)).toString(),
    "0"
  );

  return (
    <div className="flex flex-col items-center w-full bg-neutral max-w-[28rem] my-8">
      <div className="flex flex-col gap-6 justify-center min-h-[300px] w-full">
        <div className="text-center">
          <p className="text-secondary mb-2">Available to claim</p>
          <div className="text-4xl font-bold text-primary mb-1">
            {hasNoClaimableTokens
              ? "0.00"
              : convertYoctoToNear(
                  actualTotalAmount,
                  BigInt(actualTotalAmount) < BigInt(1e22) ? 5 : 2
                )}
          </div>
          <div className="flex items-center justify-center gap-1 text-sm text-secondary">
            <AssetIcon
              icon={NEAR_TOKEN_METADATA.icon}
              name={NEAR_TOKEN_METADATA.name}
            />
            NEAR
          </div>
        </div>

        <div className="text-center border border-line rounded-lg p-4 my-8">
          <p className="text-secondary text-sm">
            {hasNoClaimableTokens
              ? "You have no tokens left to claim, the next claim round ends within 2 weeks, please check back then."
              : "Rewards are calculated based on your veNEAR holdings and the duration of your lockup. The longer you lock and the more you stake, the higher your rewards."}
          </p>
        </div>

        <UpdatedButton
          type="primary"
          onClick={handleClaim}
          isLoading={isClaiming || isCheckingStatus}
          disabled={hasNoClaimableTokens}
          fullWidth
        >
          {hasNoClaimableTokens ? "No rewards to claim" : "Claim rewards"}
        </UpdatedButton>
      </div>
    </div>
  );
}
