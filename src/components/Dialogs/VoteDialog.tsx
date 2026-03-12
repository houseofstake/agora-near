"use client";

import { useCastVote } from "@/hooks/useCastVote";
import { ProposalInfo, VotingConfig } from "@/lib/contracts/types/voting";
import { useCallback, memo, useState } from "react";
import toast from "react-hot-toast";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useNear } from "@/contexts/NearContext";
import TokenAmount from "@/components/shared/TokenAmount";
import { Button } from "@/components/ui/button";
import { capitalizeFirstLetter, cn } from "@/lib/utils";
import { AlertCircle, CheckIcon, XIcon } from "lucide-react";
import { useProposalVotingPower } from "@/hooks/useProposalVotingPower";

export function LoadingVote() {
  return (
    <div className="flex flex-col w-full">
      <div className="mb-2 text-2xl font-black text-primary">
        Casting your vote
      </div>
      <div className="mb-5 text-sm text-secondary">
        It might take up to a minute for the changes to be reflected.
      </div>
      <div>
        <div
          className={`flex flex-row justify-center w-full py-3 bg-line rounded-lg`}
        >
          <div className="font-medium text-secondary">
            Writing your vote to the chain...
          </div>
        </div>
      </div>
    </div>
  );
}

interface NearVoteDialogProps {
  proposal: ProposalInfo;
  config: VotingConfig;
  closeDialog: () => void;
  preSelectedVote?: number;
  onSuccess?: () => void;
}

function ConfirmVoteContent({
  proposal,
  votingPower,
  selectedVote,
  onConfirm,
}: {
  proposal: ProposalInfo;
  votingPower: string;
  selectedVote: number;
  onConfirm: () => void;
}) {
  const voteLabel = capitalizeFirstLetter(
    proposal.voting_options[selectedVote].toLowerCase()
  );
  const isFor = selectedVote === 0;
  const isAgainst = selectedVote === 1;

  return (
    <div className="flex flex-col gap-4 w-full">
      <h2 className="text-xl font-bold text-primary">Confirm your vote</h2>
      <div className="flex items-center justify-center gap-2 rounded-lg bg-negative/10 text-negative px-3 py-2">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <p className="text-xs text-secondary">
          Your vote cannot be changed once submitted.
        </p>
      </div>
      <div className="flex items-center justify-center gap-2 rounded-lg bg-line px-3 py-2.5">
        <span className="text-primary flex items-center gap-1">
          Vote{" "}
          {isFor && (
            <CheckIcon className="h-4 w-4 text-positive flex-shrink-0" />
          )}
          {isAgainst && (
            <XIcon className="h-4 w-4 text-negative flex-shrink-0" />
          )}
          <span
            className={cn(
              "font-semibold",
              isFor
                ? "text-positive"
                : isAgainst
                  ? "text-negative"
                  : "text-secondary"
            )}
          >
            {voteLabel}
          </span>{" "}
          with{" "}
          <span className="font-semibold">
            <TokenAmount amount={votingPower} currency="veNEAR" />
          </span>
        </span>
      </div>
      <Button className="w-full" onClick={onConfirm}>
        Confirm and Cast Vote
      </Button>
    </div>
  );
}

function NearVoteDialogComponent({
  proposal,
  config,
  closeDialog,
  preSelectedVote,
  onSuccess,
}: NearVoteDialogProps) {
  const { castVote } = useCastVote({ onSuccess });
  const { signedAccountId } = useNear();
  const { votingPower } = useProposalVotingPower({
    accountId: signedAccountId,
    proposal,
  });
  const { trackVoteCast, trackVoteFailed, trackVoteDialogOpened } =
    useAnalytics();
  const [isCasting, setIsCasting] = useState(false);

  const handleConfirm = useCallback(async () => {
    if (
      !config?.vote_storage_fee ||
      preSelectedVote === undefined ||
      !proposal?.snapshot_and_state?.snapshot.block_height
    ) {
      toast.error(`Something went wrong`);
      closeDialog();
      return;
    }

    setIsCasting(true);
    trackVoteDialogOpened({
      proposal_id: String(proposal.id),
      user_voting_power: votingPower || "0",
    });

    try {
      const result = await castVote({
        proposalId: proposal.id,
        voteIndex: preSelectedVote,
        blockId: proposal.snapshot_and_state.snapshot.block_height,
        voteStorageFee: config.vote_storage_fee,
      });

      trackVoteCast({
        proposal_id: String(proposal.id),
        vote_choice: proposal.voting_options[preSelectedVote],
        voting_power_used: votingPower || "0",
        tx_hash: (result as any)?.transaction_outcome?.id || "unknown",
      });
    } catch (error) {
      console.error(`Error casting vote: ${error}`);
      trackVoteFailed({
        proposal_id: String(proposal.id),
        error_type: "vote_error",
      });
      setIsCasting(false);
      return;
    }
    closeDialog();
  }, [
    config?.vote_storage_fee,
    preSelectedVote,
    proposal,
    votingPower,
    castVote,
    closeDialog,
    trackVoteDialogOpened,
    trackVoteCast,
    trackVoteFailed,
  ]);

  if (
    preSelectedVote === undefined ||
    !config?.vote_storage_fee ||
    !proposal?.snapshot_and_state?.snapshot.block_height
  ) {
    return null;
  }

  if (isCasting) {
    return <LoadingVote />;
  }

  return (
    <ConfirmVoteContent
      proposal={proposal}
      votingPower={votingPower || "0"}
      selectedVote={preSelectedVote}
      onConfirm={handleConfirm}
    />
  );
}

export const NearVoteDialog = memo(NearVoteDialogComponent);
