"use client";

import { Button } from "@/components/ui/button";
import { useNear } from "@/contexts/NearContext";
import { useCastVote } from "@/hooks/useCastVote";
import { useVotingPower } from "@/hooks/useVotingPower";
import { ProposalInfo, VotingConfig } from "@/lib/contracts/types/voting";
import { useState } from "react";
import toast from "react-hot-toast";
import { LoadingVote } from "./VoteDialog";
import TokenAmount from "../shared/TokenAmount";
import { RadioButton } from "../ui/radio-button";
import { Skeleton } from "../ui/skeleton";
import { capitalizeFirstLetter } from "@/lib/utils";

import { useAnalytics } from "@/hooks/useAnalytics";
import { useEffect } from "react";

export function VoteOptionsDialog({
  proposal,
  config,
  closeDialog,
}: {
  proposal: ProposalInfo;
  config: VotingConfig;
  closeDialog: () => void;
}) {
  const { signedAccountId } = useNear();
  const { castVote, isVoting, error: votingError } = useCastVote({});
  const [selectedOption, setSelectedOption] = useState<number>();

  const { data: votingPower } = useVotingPower(signedAccountId);

  const {
    trackVoteDialogOpened,
    trackVoteOptionSelected,
    trackVoteCast,
    trackVoteFailed,
  } = useAnalytics();

  useEffect(() => {
    trackVoteDialogOpened({
      proposal_id: String(proposal.id),
      user_voting_power: votingPower || "0",
    });
  }, [proposal.id, trackVoteDialogOpened, votingPower]);

  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
    trackVoteOptionSelected({
      proposal_id: String(proposal.id),
      vote_choice: proposal.voting_options[index],
    });
  };

  const handleVote = async () => {
    if (
      !config?.vote_storage_fee ||
      selectedOption === undefined ||
      !proposal?.snapshot_and_state?.snapshot.block_height
    ) {
      toast.error(`Something went wrong`);
      return;
    }

    try {
      const result = await castVote({
        proposalId: proposal.id,
        voteIndex: selectedOption,
        blockId: proposal.snapshot_and_state.snapshot.block_height,
        voteStorageFee: config.vote_storage_fee,
      });

      trackVoteCast({
        proposal_id: String(proposal.id),
        vote_choice: proposal.voting_options[selectedOption],
        voting_power_used: votingPower || "0",
        tx_hash: (result as any)?.transaction_outcome?.id || "unknown",
      });

      closeDialog();
    } catch (error) {
      console.error(`Error casting vote: ${error}`);
      trackVoteFailed({
        proposal_id: String(proposal.id),
        error_type: "vote_error",
      });
    }
  };

  if (isVoting) {
    return <LoadingVote />;
  }

  return (
    <div
      className="flex flex-col gap-4 w-full relative"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="flex flex-col">
        <div className="text-xs text-tertiary font-medium">
          {signedAccountId}
        </div>
        <p className="text-xl font-extrabold">Select an option</p>
      </div>
      <div className="flex flex-col max-h-[46vh] overflow-y-scroll">
        {proposal.voting_options.map((option, index) => (
          <RadioButton
            key={index}
            title={option}
            checked={selectedOption === index}
            onClick={() => handleOptionSelect(index)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col justify-between items-stretch">
          <Button onClick={handleVote} disabled={selectedOption === undefined}>
            {selectedOption !== undefined ? (
              <>
                {`Vote ${capitalizeFirstLetter(
                  proposal.voting_options[selectedOption].toLowerCase()
                )} with`}
                {"\u00A0"}
                {votingPower ? (
                  <TokenAmount amount={votingPower} currency="veNEAR" />
                ) : (
                  <Skeleton className="w-4 h-4" />
                )}
              </>
            ) : (
              "Select an option"
            )}
          </Button>
        </div>
        {votingError && (
          <p className="text-red-500 text-sm">{votingError.message}</p>
        )}
      </div>
    </div>
  );
}
