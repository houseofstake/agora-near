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

function NearVoteDialogComponent({
  proposal,
  config,
  closeDialog,
  preSelectedVote,
  onSuccess,
}: NearVoteDialogProps) {
  const { castVote } = useCastVote({ onSuccess });

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

      try {
        await castVote({
          proposalId: proposal.id,
          voteIndex: preSelectedVote,
          blockId: proposal.snapshot_and_state.snapshot.block_height,
          voteStorageFee: config.vote_storage_fee,
        });
      } catch (error) {
        console.error(`Error casting vote: ${error}`);
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
  ]);

  return <LoadingVote />;
}

export const NearVoteDialog = memo(NearVoteDialogComponent);
