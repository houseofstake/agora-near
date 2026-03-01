"use client";

import { useCastVote } from "@/hooks/useCastVote";
import { ProposalInfo, VotingConfig } from "@/lib/contracts/types/voting";
import { useEffect, memo } from "react";
import toast from "react-hot-toast";

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
            Recording your vote on the NEAR blockchain...
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

import { useAnalytics } from "@/hooks/useAnalytics";
import { useNear } from "@/contexts/NearContext";
import { useVotingPower } from "@/hooks/useVotingPower";

function NearVoteDialogComponent({
  proposal,
  config,
  closeDialog,
  preSelectedVote,
  onSuccess,
}: NearVoteDialogProps) {
  const { castVote } = useCastVote({ onSuccess });
  const { signedAccountId } = useNear();
  const { data: votingPower } = useVotingPower(signedAccountId);
  const { trackVoteCast, trackVoteFailed, trackVoteDialogOpened } =
    useAnalytics();

  useEffect(() => {
    const castVoteOnMount = async () => {
      if (
        !config?.vote_storage_fee ||
        preSelectedVote === undefined ||
        !proposal?.snapshot_and_state?.snapshot.block_height
      ) {
        toast.error(`Something went wrong`);
        closeDialog();
        return;
      }

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
      } finally {
        closeDialog();
      }
    };

    castVoteOnMount();
  }, [
    castVote,
    closeDialog,
    config?.vote_storage_fee,
    preSelectedVote,
    proposal?.id,
    proposal?.snapshot_and_state?.snapshot.block_height,
    trackVoteCast,
    trackVoteFailed,
    trackVoteDialogOpened,
    votingPower,
    proposal.voting_options,
  ]);

  return <LoadingVote />;
}

export const NearVoteDialog = memo(NearVoteDialogComponent);
