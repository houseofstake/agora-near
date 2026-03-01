import { ArrowRightIcon } from "lucide-react";
import { memo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatedStars } from "./AnimatedStars";
import { useNear } from "@/contexts/NearContext";
import { useNearClaimProofs } from "@/hooks/useNearClaimProofs";
import { UpdatedButton } from "@/components/Button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import LoadingSpinner from "../shared/LoadingSpinner";
import GreenStar from "@/assets/green_star.svg";
import { useAnalytics } from "@/hooks/useAnalytics";

export const GovernanceRewardsCard = memo(() => {
  const { signedAccountId } = useNear();
  const { hasUnclaimedRewards, isLoading, data } =
    useNearClaimProofs(signedAccountId);
  const openDialog = useOpenDialog();

  const { trackRewardsPageViewed } = useAnalytics();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!isLoading && !hasTracked.current) {
      hasTracked.current = true;
      const totalUnclaimed = data?.proofs
        ?.filter((p: any) => !p.claimed)
        ?.reduce(
          (sum: bigint, p: any) => sum + BigInt(p.amount ?? "0"),
          BigInt(0)
        )
        ?.toString();
      trackRewardsPageViewed({
        has_unclaimed_rewards: !!hasUnclaimedRewards,
        unclaimed_amount_yocto: totalUnclaimed,
      });
    }
  }, [isLoading, hasUnclaimedRewards, data, trackRewardsPageViewed]);

  const handleClaimClick = () => {
    openDialog({
      type: "NEAR_CLAIM",
      params: {},
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-black rounded-2xl p-6 text-white relative overflow-hidden h-full">
        <div className="relative z-10 flex justify-center items-center w-full h-full">
          <div className="flex-1 flex justify-center items-center">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  const hasClaimedRewards =
    data && data.proofs.length > 0 && !hasUnclaimedRewards;

  if (hasUnclaimedRewards) {
    return (
      <div className="flex-1 bg-black rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10 flex">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-lg font-semibold">
                Claim your veNEAR Rewards
              </div>
            </div>
            <div className="text-sm text-gray-300 mb-6">
              Your veNEAR reward is ready to claim.
            </div>
            <div className="flex justify-between">
              <UpdatedButton
                type="secondary"
                variant="rounded"
                onClick={handleClaimClick}
                isLoading={isLoading}
                className="w-24"
              >
                Claim
              </UpdatedButton>
              <Link
                href="/info#ve-near-rewards"
                className="text-sm text-white hover:text-gray-200 flex items-center gap-1"
              >
                Learn more <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-4 ml-8">
            <Image src={GreenStar} alt="" className="w-6 h-6" />
            <Image src={GreenStar} alt="" className="w-6 h-6" />
            <Image src={GreenStar} alt="" className="w-6 h-6" />
            <Image src={GreenStar} alt="" className="w-6 h-6" />
          </div>
        </div>
      </div>
    );
  }

  if (hasClaimedRewards) {
    return (
      <div className="flex-1 bg-black rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10 flex">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-lg font-semibold">veNEAR Rewards</div>
            </div>
            <div className="text-sm text-gray-300 mb-6">
              Rewards already claimed, stay tuned for the next campaign
            </div>
            <Link
              href="/info#ve-near-rewards"
              className="text-sm text-white hover:text-gray-200 flex items-center gap-1"
            >
              Learn more <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <AnimatedStars />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-black rounded-2xl p-6 text-white relative overflow-hidden">
      <div className="relative z-10 flex">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-lg font-semibold">veNEAR Rewards</div>
          </div>
          <div className="text-sm text-gray-300 mb-6">
            Stay tuned for the next campaign
          </div>
          <Link
            href="/info#ve-near-rewards"
            className="text-sm text-white hover:text-gray-200 flex items-center gap-1"
          >
            Learn more <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
        <AnimatedStars />
      </div>
    </div>
  );
});

GovernanceRewardsCard.displayName = "GovernanceRewardsCard";
