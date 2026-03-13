"use client";

import {
  ProposalInfo,
  ProposalStatus,
  VotingConfig,
} from "@/lib/contracts/types/voting";
import { useState, useEffect } from "react";
import Image from "next/image";
import ProposalVoteFilter from "./ProposalVoteFilter";
import ProposalVoteSummary from "./ProposalVoteSummary";
import ProposalVotingActions from "./ProposalVotingActions";
import InfiniteScroll from "react-infinite-scroller";
import { useProposalVotes } from "@/hooks/useProposalVotes";
import { HStack } from "@/components/Layout/Stack";
import { VStack } from "@/components/Layout/Stack";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { HoverCardSocialProfile } from "./HoverCardSocialProfile";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, CheckIcon, X, MinusIcon, ListFilter } from "lucide-react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import TokenAmount from "@/components/shared/TokenAmount";
import clsx from "clsx";
import { useNear } from "@/contexts/NearContext";
import { useProposalNonVoters } from "@/hooks/useProposalNonVoters";
import { icons } from "@/assets/icons";
import Link from "next/link";
import { truncateAddress, truncateMiddle } from "@/lib/text";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
type VoteTypeFilter = "All" | "For" | "Against";
type SortOption = "weight_high" | "weight_low" | "time_newest" | "time_oldest";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [voteTypeFilter, setVoteTypeFilter] = useState<VoteTypeFilter>("All");
  const [sortBy, setSortBy] = useState<SortOption>("weight_high");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const {
    data: votingHistory,
    isPending: isVotingHistoryPending,
    hasNextPage,
    fetchNextPage,
  } = useProposalVotes({
    proposalId: proposal.id.toString(),
    pageSize: 20,
    search: debouncedSearch || undefined,
    voteOption:
      voteTypeFilter === "All"
        ? "all"
        : voteTypeFilter === "For"
          ? "for"
          : "against",
    sortBy: sortBy.startsWith("weight") ? "weight" : "voted_at",
    sortOrder:
      sortBy === "weight_high" || sortBy === "time_newest" ? "desc" : "asc",
  });

  const {
    data: nonVoters,
    isPending: isNonVotersPending,
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
      className={`fixed flex justify-between gap-4 md:sticky top-[auto] md:top-20 max-h-[calc(100%-160px)] items-stretch flex-shrink w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] md:w-[20rem] lg:w-[24rem] bg-neutral border border-line rounded-xl shadow-newDefault mb-8 transition-all ${isClicked ? "bottom-[20px]" : "bottom-[calc(-100%+350px)] h-[calc(100%-160px)] md:h-auto"} md:overflow-y-auto max-w-full overflow-hidden`}
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
          <div className="flex flex-col gap-1 px-4">
            <div className="font-semibold text-primary">Voting activity</div>
          </div>
          <ProposalVoteSummary proposal={proposal} />
          <div className="px-4">
            <ProposalVoteFilter
              initialSelection={showVoters ? "Voters" : "Hasn't voted"}
              onSelectionChange={(value) => {
                setShowVoters(value === "Voters");
              }}
            />
          </div>
          <div className="px-4 pb-4 overflow-y-auto max-h-[calc(100vh-580px)] scrollbar-hide">
            {showVoters && (
              <div className="flex flex-col gap-3 mb-4">
                <HStack alignItems="items-center" className="w-full gap-2">
                  <div className="relative flex-1 min-w-0">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
                    <Input
                      placeholder="Search voters..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-xs bg-transparent"
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        className="absolute right-0 top-0"
                      >
                        <button
                          className="flex items-center justify-center h-9 w-9 active:ring-0"
                          aria-label="Sort options"
                        >
                          <ListFilter className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 bg-white"
                      >
                        <DropdownMenuLabel className="text-primary font-semibold uppercase">
                          Vote weight
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          className="text-sm cursor-pointer justify-between text-secondary focus:text-primary"
                          onClick={() => setSortBy("weight_high")}
                        >
                          Highest first
                          {sortBy === "weight_high" && (
                            <Check className="h-4 w-4" />
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-sm cursor-pointer justify-between text-secondary focus:text-primary"
                          onClick={() => setSortBy("weight_low")}
                        >
                          Lowest first
                          {sortBy === "weight_low" && (
                            <Check className="h-4 w-4" />
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-primary font-semibold uppercase">
                          Vote time
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          className="text-sm cursor-pointer justify-between text-secondary focus:text-primary"
                          onClick={() => setSortBy("time_newest")}
                        >
                          Newest first
                          {sortBy === "time_newest" && (
                            <Check className="h-4 w-4" />
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-sm cursor-pointer justify-between text-secondary focus:text-primary"
                          onClick={() => setSortBy("time_oldest")}
                        >
                          Oldest first
                          {sortBy === "time_oldest" && (
                            <Check className="h-4 w-4" />
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </HStack>
                <div className="flex flex-row gap-2">
                  {(["All", "For", "Against"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setVoteTypeFilter(opt)}
                      className={clsx(
                        "flex-1 py-1 px-3 rounded-md text-sm font-medium transition-colors",
                        voteTypeFilter === opt
                          ? "bg-black text-white shadow-sm"
                          : "bg-white border border-line text-primary hover:bg-neutral/50"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!showVoters && !isNonVotersPending && nonVoters && (
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
                          <HStack
                            justifyContent="justify-between"
                            className="font-semibold text-secondary w-full"
                          >
                            <HStack
                              gap={1}
                              alignItems="items-center"
                              className="min-w-0 flex-1 overflow-hidden"
                            >
                              <HoverCard openDelay={100} closeDelay={100}>
                                <HoverCardTrigger>
                                  <Link
                                    href={`/delegates/${nonVoter.registeredVoterId}`}
                                    className="hover:text-primary transition-colors"
                                  >
                                    <span className="hidden sm:inline">
                                      {truncateAddress(
                                        nonVoter.registeredVoterId
                                      )}
                                    </span>
                                    <span className="inline sm:hidden">
                                      {truncateMiddle(
                                        nonVoter.registeredVoterId,
                                        4,
                                        4
                                      )}
                                    </span>
                                  </Link>
                                </HoverCardTrigger>
                                <HoverCardContent
                                  className="w-auto p-0 rounded-xl"
                                  side="top"
                                >
                                  <HoverCardSocialProfile
                                    address={nonVoter.registeredVoterId}
                                  />
                                </HoverCardContent>
                              </HoverCard>
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
                        </VStack>
                      </VStack>
                    </li>
                  ))}
                </ul>
              </InfiniteScroll>
            )}

            {showVoters && !isVotingHistoryPending && votingHistory && (
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
                        gap={0}
                        className="text-xs text-tertiary px-0 py-2"
                      >
                        <HStack
                          justifyContent="justify-between"
                          alignItems="items-start"
                          className="w-full gap-2"
                        >
                          <VStack gap={0} className="min-w-0 flex-1">
                            <HStack
                              gap={1}
                              alignItems="items-center"
                              className="font-semibold text-secondary"
                            >
                              <HoverCard openDelay={100} closeDelay={100}>
                                <HoverCardTrigger>
                                  <Link
                                    href={`/delegates/${vote.accountId}`}
                                    className="hover:text-primary transition-colors"
                                  >
                                    <span className="hidden sm:inline">
                                      {truncateAddress(vote.accountId)}
                                    </span>
                                    <span className="inline sm:hidden">
                                      {truncateMiddle(vote.accountId, 4, 4)}
                                    </span>
                                  </Link>
                                </HoverCardTrigger>
                                <HoverCardContent
                                  className="w-auto p-0 rounded-xl"
                                  side="top"
                                >
                                  <HoverCardSocialProfile
                                    address={vote.accountId}
                                  />
                                </HoverCardContent>
                              </HoverCard>
                              {vote.accountId === signedAccountId && (
                                <span className="text-primary">(you)</span>
                              )}
                            </HStack>
                            <span className="text-tertiary text-[10px]">
                              {format(
                                new Date(vote.votedAt || 0),
                                "yyyy-MM-dd h:mm a"
                              )}
                            </span>
                          </VStack>
                          <HStack
                            alignItems="items-center"
                            className="flex-shrink-0"
                          >
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
                                <TooltipContent className="p-4 flex flex-col gap-1">
                                  <span>
                                    <TokenAmount amount={vote.votingPower} />{" "}
                                    Voted{" "}
                                    {Number(vote.voteOption) === 0
                                      ? "For"
                                      : Number(vote.voteOption) === 1
                                        ? "Against"
                                        : "Abstain"}
                                  </span>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </HStack>
                        </HStack>
                      </VStack>
                    </li>
                  ))}
                </ul>
              </InfiniteScroll>
            )}

            {(isVotingHistoryPending || isNonVotersPending) && (
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
