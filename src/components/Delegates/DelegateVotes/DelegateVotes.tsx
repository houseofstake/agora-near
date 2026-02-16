"use client";

import { HStack, VStack } from "../../Layout/Stack";
import { formatDistanceToNow } from "date-fns";
import InfiniteScroll from "react-infinite-scroller";
import VoteDetailsContainer from "./DelegateVotesDetailsContainer";
import DelegateVoteIcon from "./DelegateVoteIcon";
import { VoteHistory } from "@/lib/api/delegates/types";
import TokenAmount from "@/components/shared/TokenAmount";

export default function DelegateVotes({
  votingHistory,
  hasMore,
  onLoadMore,
}: {
  votingHistory: VoteHistory[];
  hasMore: boolean;
  onLoadMore: () => void;
}) {
  const InfiniteScrollAny = InfiniteScroll as any;

  return (
    <InfiniteScrollAny
      hasMore={hasMore}
      pageStart={0}
      loadMore={onLoadMore}
      useWindow={false}
      loader={
        <div key={0}>
          <HStack
            key="loader"
            className="gl_loader justify-center py-6 text-sm text-secondary"
          >
            Loading...
          </HStack>
        </div>
      }
      element="main"
      className="divide-y divide-line overflow-hidden bg-neutral shadow-newDefault ring-1 ring-line rounded-xl"
    >
      {votingHistory.map(
        (vote) =>
          vote && (
            <VoteDetailsContainer
              key={vote.proposalId}
              proposalId={vote.proposalId}
            >
              <div>
                <VStack className="py-4 px-6">
                  <HStack justifyContent="justify-between" gap={2}>
                    <VStack>
                      <span className="text-tertiary text-xs font-medium">
                        Voted{" "}
                        {vote.voteOption === "0"
                          ? "for"
                          : vote.voteOption === "1"
                            ? "against"
                            : "abstain"}{" "}
                        on this proposal{" "}
                        {formatDistanceToNow(new Date(vote.votedAt ?? 0))} ago
                        with{" "}
                        <TokenAmount
                          amount={vote.votingPower}
                          currency="veNEAR"
                        />
                      </span>
                      <h2 className="px-0 pt-1 overflow-hidden text-base text-primary text-ellipsis">
                        {vote.proposalName ?? `Proposal #${vote.proposalId}`}
                      </h2>
                    </VStack>
                    <DelegateVoteIcon
                      support={
                        vote.voteOption === "0"
                          ? "FOR"
                          : vote.voteOption === "1"
                            ? "AGAINST"
                            : "ABSTAIN"
                      }
                    />
                  </HStack>
                </VStack>
              </div>
            </VoteDetailsContainer>
          )
      )}
    </InfiniteScrollAny>
  );
}
