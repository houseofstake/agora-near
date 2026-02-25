import { TrendingUp } from "lucide-react";
import { memo, useCallback } from "react";
import TokenAmount from "../shared/TokenAmount";
import { useVotingPower } from "@/hooks/useVotingPower";
import { useNear } from "@/contexts/NearContext";
import { Skeleton } from "../ui/skeleton";
import { useOpenDialog } from "../Dialogs/DialogProvider/DialogProvider";

export const VotingPowerCard = memo(() => {
  const { signedAccountId } = useNear();
  const { data: votingPower, isLoading } = useVotingPower(signedAccountId);
  const openDialog = useOpenDialog();

  const handleViewProjections = useCallback(() => {
    if (votingPower) {
      openDialog({
        type: "VOTING_POWER_PROJECTIONS",
        className: "sm:w-[60%]",
        params: {
          votingPower,
        },
      });
    }
  }, [openDialog, votingPower]);

  return (
    <div className="flex-1 bg-neutral rounded-2xl border border-line p-6">
      <div className="flex flex-col">
        <div className="text-sm text-secondary mb-2">Voting Power veNEAR</div>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-4xl font-light text-primary">
            {isLoading ? (
              <Skeleton className="w-24 h-10" />
            ) : (
              <TokenAmount
                amount={votingPower ?? "0"}
                hideCurrency={true}
                minimumFractionDigits={4}
              />
            )}
          </span>
          <button
            className="flex items-center gap-1 text-sm hover:text-blue-600 transition-colors"
            onClick={handleViewProjections}
            disabled={!votingPower || isLoading}
          >
            View Projections
            <TrendingUp />
          </button>
        </div>
      </div>
    </div>
  );
});

VotingPowerCard.displayName = "VotingPowerCard";
