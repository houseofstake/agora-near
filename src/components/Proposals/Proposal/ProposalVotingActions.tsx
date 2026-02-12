"use client";

import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import TokenAmount from "@/components/shared/TokenAmount";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNear } from "@/contexts/NearContext";
import { useCheckVoterStatus } from "@/hooks/useCheckVoterStatus";
import { CHART_DATA_QK } from "@/hooks/useProposalChartData";
import { VOTES_QK } from "@/hooks/useProposalVotes";

import { TooltipWithTap } from "@/components/ui/tooltip-with-tap";
import { useProposalVotingPower } from "@/hooks/useProposalVotingPower";
import { useUserVote } from "@/hooks/useUserVote";
import { useAnalytics } from "@/hooks/useAnalytics";
import { ProposalInfo, VotingConfig } from "@/lib/contracts/types/voting";
import { capitalizeFirstLetter } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import Big from "big.js";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

const ProposalVotingActionsFallback = memo(() => {
  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="flex-1 w-full flex flex-row gap-2">
        <Skeleton className="flex-1 h-10" />
        <Skeleton className="flex-1 h-10" />
        <Skeleton className="flex-1 h-10" />
      </div>
      <Skeleton className="w-full h-10" />
    </div>
  );
});

ProposalVotingActionsFallback.displayName = "ProposalVotingActionsFallback";

type ProposalVotingActionsContentProps = {
  proposal: ProposalInfo;
  selectedVote?: number;
  setSelectedVote: (vote: number) => void;
  onSubmitPress: () => void;
  votingPower: string;
  hasVoted: boolean;
  isUpdatingVote: boolean;
};

const ProposalVotingActionsContent = memo(
  ({
    proposal,
    selectedVote,
    setSelectedVote,
    onSubmitPress,
    votingPower,
    hasVoted,
    isUpdatingVote,
  }: ProposalVotingActionsContentProps) => {
    const submitVotePrefix = useMemo(() => {
      if (hasVoted && !isUpdatingVote) {
        return "You voted";
      }

      if (hasVoted && isUpdatingVote) {
        return "Update vote to";
      }

      return "Vote";
    }, [hasVoted, isUpdatingVote]);

    const votingOptions = useMemo(() => {
      return proposal.voting_options.map((option, index) => {
        const isFor = index === 0;
        const isAgainst = index === 1;

        const isSelected = selectedVote === index;
        const selectedStyle = isSelected
          ? isFor
            ? "border-positive bg-positive/10 text-positive"
            : isAgainst
              ? "border-negative bg-negative/10 text-negative"
              : "border-secondary bg-secondary/10 text-secondary"
          : "bg-neutral";

        return (
          <button
            key={index}
            className={`${selectedStyle} rounded-md h-8 border border-line text-sm font-medium cursor-pointer py-2 transition-all hover:bg-wash active:shadow-none disabled:bg-line disabled:text-secondary capitalize flex items-center justify-center flex-1`}
            onClick={() => setSelectedVote(index)}
          >
            {option.toLowerCase()}
          </button>
        );
      });
    }, [proposal.voting_options, selectedVote, setSelectedVote]);

    const hasVotingPower = Big(votingPower).gt(0);
    const hasSelectedVote = selectedVote !== undefined;

    const isVoteSubmissionDisabled =
      !hasVotingPower || !hasSelectedVote || (hasVoted && !isUpdatingVote);

    const submitButton = useMemo(() => {
      if (!hasVotingPower) {
        return (
          <TooltipWithTap
            content={
              <div className="max-w-[350px] flex flex-col text-left p-3">
                <p>
                  Sorry, you can&apos;t vote if you had no voting power at the
                  time of the proposal.
                </p>
              </div>
            }
          >
            <div>
              <Button className="w-full" disabled>
                Vote
              </Button>
            </div>
          </TooltipWithTap>
        );
      }

      return (
        <Button
          onClick={onSubmitPress}
          className="w-full"
          disabled={isVoteSubmissionDisabled}
        >
          {selectedVote !== undefined ? (
            <>
              {submitVotePrefix}{" "}
              {capitalizeFirstLetter(
                proposal.voting_options[selectedVote].toLowerCase()
              )}{" "}
              with
              {"\u00A0"}
              <TokenAmount amount={votingPower} currency="veNEAR" />
            </>
          ) : (
            "Select an option"
          )}
        </Button>
      );
    }, [
      hasVotingPower,
      isVoteSubmissionDisabled,
      onSubmitPress,
      proposal.voting_options,
      selectedVote,
      submitVotePrefix,
      votingPower,
    ]);

    return (
      <div className="flex flex-col gap-3 py-3 px-3 border-t border-line">
        <div className="flex flex-row gap-2">{votingOptions}</div>
        {submitButton}
      </div>
    );
  }
);

ProposalVotingActionsContent.displayName = "ProposalVotingActionsContent";

export default function ProposalVotingActions({
  proposal,
  config,
}: {
  proposal: ProposalInfo;
  config: VotingConfig;
}) {
  const { signedAccountId } = useNear();
  const openDialog = useOpenDialog();
  const { signIn } = useNear();
  const { trackVoteDialogOpened } = useAnalytics();
  const [selectedVote, setSelectedVote] = useState<number>();

  const { voteIndex: userVoteIndex, isLoading: isLoadingUserVote } =
    useUserVote(proposal.id);

  useEffect(() => {
    if (
      userVoteIndex !== undefined &&
      userVoteIndex !== null &&
      selectedVote === undefined
    ) {
      setSelectedVote(userVoteIndex);
    }
  }, [userVoteIndex, selectedVote]);

  const { votingPower, isLoading: isLoadingVotingPower } =
    useProposalVotingPower({
      proposal,
      accountId: signedAccountId,
    });

  const { isRegisteredToVote, isLoading: isLoadingVoterStatus } =
    useCheckVoterStatus({
      enabled: !!signedAccountId,
    });

  const queryClient = useQueryClient();

  const openVoteDialog = useCallback(() => {
    trackVoteDialogOpened({
      proposal_id: proposal.id.toString(),
      user_voting_power: votingPower || "0",
    });
    openDialog({
      type: "NEAR_VOTE",
      params: {
        proposal,
        config,
        preSelectedVote: selectedVote,
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [VOTES_QK, String(proposal.id)],
          });

          queryClient.invalidateQueries({
            queryKey: [CHART_DATA_QK, String(proposal.id)],
          });
        },
      },
    });
  }, [
    openDialog,
    proposal,
    config,
    selectedVote,
    queryClient,
    trackVoteDialogOpened,
    votingPower,
  ]);

  if (!signedAccountId) {
    return (
      <div className="flex flex-col justify-between py-3 px-3 border-t border-line">
        <Button className="w-full" onClick={signIn}>
          Connect wallet to vote
        </Button>
      </div>
    );
  }

  if (proposal.status !== "Voting") {
    return (
      <div className="flex flex-col justify-between py-3 px-3 border-t border-line">
        <Button className="w-full" disabled>
          Not open to voting
        </Button>
      </div>
    );
  }

  if (isLoadingUserVote || isLoadingVotingPower || isLoadingVoterStatus) {
    return <ProposalVotingActionsFallback />;
  }

  if (!isRegisteredToVote) {
    return null;
  }

  const hasVoted = userVoteIndex !== null && userVoteIndex !== undefined;
  const isUpdatingVote =
    hasVoted && selectedVote !== undefined && selectedVote !== userVoteIndex;

  return (
    <ProposalVotingActionsContent
      proposal={proposal}
      selectedVote={selectedVote}
      setSelectedVote={setSelectedVote}
      onSubmitPress={openVoteDialog}
      votingPower={votingPower ?? "0"}
      hasVoted={hasVoted}
      isUpdatingVote={isUpdatingVote}
    />
  );
}
