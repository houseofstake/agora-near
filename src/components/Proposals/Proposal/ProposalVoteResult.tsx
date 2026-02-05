"use client";

import { ProposalInfo, VotingConfig } from "@/lib/contracts/types/voting";
import { useState } from "react";
import Image from "next/image";
import ProposalVoteFilter from "./ProposalVoteFilter";
import ProposalVoteSummary from "./ProposalVoteSummary";
import ProposalVotingActions from "./ProposalVotingActions";
import InfiniteScroll from "react-infinite-scroller";
import { useProposalVotes } from "@/hooks/useProposalVotes";
import { HStack } from "@/components/Layout/Stack";
import { VStack } from "@/components/Layout/Stack";
import { HoverCard, HoverCardTrigger } from "@/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckIcon, X, MinusIcon } from "lucide-react";
import TokenAmount from "@/components/shared/TokenAmount";
import clsx from "clsx";
import { useNear } from "@/contexts/NearContext";
import { useProposalNonVoters } from "@/hooks/useProposalNonVoters";
import { icons } from "@/assets/icons";
import Link from "next/link";
import { truncateAddress } from "@/lib/text";

const ProposalVoteResult = ({
  proposal,
  config,
}: {
  proposal: ProposalInfo;
  config: VotingConfig;
}) => {
  const [showVoters, setShowVoters] = useState(true);
  const { signedAccountId } = useNear();
  const [isClicked, setIsClicked] = useState(false);

  const {
    data: votingHistory,
    isFetching: isVotingHistoryFetching,
    hasNextPage,
    fetchNextPage,
  } = useProposalVotes({
    proposalId: proposal.id.toString(),
    pageSize: 20,
  });

  const {
    data: nonVoters,
    isLoading: isNonVotersLoading,
    hasNextPage: hasNextNonVotersPage,
    fetchNextPage: fetchNextNonVotersPage,
  } = useProposalNonVoters({
    proposalId: proposal.id.toString(),
    pageSize: 20,
  });

  const handleClick = () => {
    setIsClicked(!isClicked);
  };

  return (
    <div
      className={`fixed flex justify-between gap-4 md:sticky top-[auto] md:top-20 md:max-h-[calc(100vh-220px)] max-h-[calc(100%-160px)] items-stretch flex-shrink w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] md:w-[20rem] lg:w-[24rem] bg-neutral border border-line rounded-xl shadow-newDefault mb-8 transition-all ${isClicked ? "bottom-[20px]" : "bottom-[calc(-100%+350px)] h-[calc(100%-160px)] md:h-auto"} md:overflow-y-auto`}
      style={{
        transition: "bottom 600ms cubic-bezier(0, 0.975, 0.015, 0.995)",
      }}
    >
      <div className="flex flex-col gap-4 min-h-0 shrink pt-4 w-full">
        <button
          onClick={handleClick}
          className="border w-10 h-10 rounded-full bg-neutral absolute top-[-20px] left-[calc(50%-20px)] shadow-newDefault block md:hidden"
        >
          <div className="flex flex-col justify-center">
            <Image
              className="opacity-60"
              src={icons.expand.src}
              alt="expand"
              width={16}
              height={16}
            />
          </div>
        </button>
        <div className="flex flex-col gap-4">
          <div className="font-semibold px-4 text-primary">Voting activity</div>
          <ProposalVoteSummary proposal={proposal} />
          <div className="px-4 pb-4">
            <ProposalVoteFilter
              initialSelection={showVoters ? "Voters" : "Hasn't voted"}
              onSelectionChange={(value) => {
                setShowVoters(value === "Voters");
              }}
            />
          </div>
          <div className="px-4 pb-4 overflow-y-auto max-h-[calc(100vh-580px)]">
            {!showVoters && !isNonVotersLoading && nonVoters && (
              <InfiniteScroll
                hasMore={hasNextNonVotersPage}
                pageStart={0}
                loadMore={() => {
                  if (hasNextNonVotersPage) {
                    fetchNextNonVotersPage();
                  }
                }}
                useWindow={false}
                loader={
                  <div
                    className="flex text-xs font-medium text-secondary"
                    key={0}
                  >
                    Loading more non-voters...
                  </div>
                }
                element="main"
              >
                <ul className="flex flex-col">
                  {nonVoters.map((nonVoter) => (
                    <li key={nonVoter.id}>
                      <VStack
                        gap={2}
                        className="text-xs text-tertiary px-0 py-1"
                      >
                        <VStack>
                          <HoverCard openDelay={100} closeDelay={100}>
                            <HoverCardTrigger>
                              <HStack
                                justifyContent="justify-between"
                                className="font-semibold text-secondary"
                              >
                                <HStack gap={1} alignItems="items-center">
                                  <Link
                                    href={`/delegates/${nonVoter.registeredVoterId}`}
                                    className="hover:text-primary transition-colors truncate max-w-[200px]"
                                  >
                                    {truncateAddress(
                                      nonVoter.registeredVoterId
                                    )}
                                  </Link>
                                  {nonVoter.registeredVoterId ===
                                    signedAccountId && (
                                    <p className="text-primary">(you)</p>
                                  )}
                                </HStack>
                                <TokenAmount
                                  amount={nonVoter.votingPower}
                                  hideCurrency
                                />
                              </HStack>
                            </HoverCardTrigger>
                          </HoverCard>
                        </VStack>
                      </VStack>
                    </li>
                  ))}
                </ul>
              </InfiniteScroll>
            )}

            {showVoters && !isVotingHistoryFetching && votingHistory && (
              <InfiniteScroll
                hasMore={hasNextPage}
                pageStart={0}
                loadMore={() => {
                  if (hasNextPage) {
                    fetchNextPage();
                  }
                }}
                useWindow={false}
                loader={
                  <div
                    className="flex text-xs font-medium text-secondary"
                    key={0}
                  >
                    Loading more votes...
                  </div>
                }
                element="main"
              >
                <ul className="flex flex-col">
                  {votingHistory.map((vote) => (
                    <li key={vote.accountId}>
                      <VStack
                        gap={2}
                        className="text-xs text-tertiary px-0 py-1"
                      >
                        <VStack>
                          <HoverCard openDelay={100} closeDelay={100}>
                            <HoverCardTrigger>
                              <HStack
                                justifyContent="justify-between"
                                className="font-semibold text-secondary"
                              >
                                <HStack gap={1} alignItems="items-center">
                                  <Link
                                    href={`/delegates/${vote.accountId}`}
                                    className="hover:text-primary transition-colors truncate max-w-[200px]"
                                  >
                                    {truncateAddress(vote.accountId)}
                                  </Link>
                                  {vote.accountId === signedAccountId && (
                                    <p className="text-primary">(you)</p>
                                  )}
                                </HStack>
                                <HStack alignItems="items-center">
                                  <TooltipProvider delayDuration={0}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div
                                          className={clsx(
                                            "flex items-center gap-1",
                                            Number(vote.voteOption) === 0
                                              ? "text-positive"
                                              : Number(vote.voteOption) === 1
                                                ? "text-negative"
                                                : "text-secondary"
                                          )}
                                        >
                                          <TokenAmount
                                            amount={vote.votingPower}
                                            hideCurrency
                                          />
                                          {Number(vote.voteOption) === 0 && (
                                            <CheckIcon
                                              strokeWidth={4}
                                              className="w-3 h-3 text-positive"
                                            />
                                          )}
                                          {Number(vote.voteOption) === 1 && (
                                            <X
                                              strokeWidth={4}
                                              className="w-3 h-3 text-negative"
                                            />
                                          )}
                                          {Number(vote.voteOption) === 2 && (
                                            <MinusIcon
                                              strokeWidth={4}
                                              className="w-3 h-3 text-secondary"
                                            />
                                          )}
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent className="p-4">
                                        <TokenAmount
                                          amount={vote.votingPower}
                                        />
                                        Voted{" "}
                                        {Number(vote.voteOption) === 0
                                          ? "For"
                                          : Number(vote.voteOption) === 1
                                            ? "Against"
                                            : "Abstain"}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </HStack>
                              </HStack>
                            </HoverCardTrigger>
                          </HoverCard>
                        </VStack>
                      </VStack>
                    </li>
                  ))}
                </ul>
              </InfiniteScroll>
            )}

            {(isVotingHistoryFetching || isNonVotersLoading) && (
              <div className="text-secondary text-xs">Loading...</div>
            )}
          </div>
          <ProposalVotingActions proposal={proposal} config={config} />
        </div>
      </div>
    </div>
  );
};

export default ProposalVoteResult;
