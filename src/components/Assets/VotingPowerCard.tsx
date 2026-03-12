import { TrendingUp } from "lucide-react";
import { memo, useCallback } from "react";
import TokenAmount from "../shared/TokenAmount";
import { useVotingPower } from "@/hooks/useVotingPower";
import { useNear } from "@/contexts/NearContext";
import { Skeleton } from "../ui/skeleton";
import { useOpenDialog } from "../Dialogs/DialogProvider/DialogProvider";
import { useDelegatedTo } from "@/hooks/useDelegatedTo";

const DELEGATION_DOCS_URL =
  "https://houseofstake.org/docs/structure/delegates-and-participants";

export const VotingPowerCard = memo(() => {
  const { signedAccountId } = useNear();
  const { data: votingPower, isLoading } = useVotingPower(signedAccountId);
  const { data: delegatedTo } = useDelegatedTo({
    pageSize: 1,
    address: signedAccountId ?? "",
    enabled: !!signedAccountId,
  });
  const openDialog = useOpenDialog();
  const isDelegating =
    !!delegatedTo?.length && (votingPower === "0" || !votingPower);

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
    <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex flex-col">
        <div className="text-sm text-gray-600 mb-2">Voting Power veNEAR</div>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-4xl font-light text-gray-900">
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
        {isDelegating && (
          <p className="text-sm text-gray-700 mt-2">
            You have transferred your voting power by delegating to another
            voter. Undelegate to reclaim your voting power.{" "}
            <a
              href={DELEGATION_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Learn more
            </a>
          </p>
        )}
      </div>
    </div>
  );
});

VotingPowerCard.displayName = "VotingPowerCard";
