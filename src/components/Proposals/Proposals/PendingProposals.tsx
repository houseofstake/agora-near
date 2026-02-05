"use client";

import { useCallback } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { cn } from "@/lib/utils";
import { usePendingProposals } from "@/hooks/usePendingProposals";
import Link from "next/link";
import { Proposal } from "@/lib/api/proposal/types";
import { format } from "date-fns";
import { useNear } from "@/contexts/NearContext";
import { useProposalConfig } from "@/hooks/useProposalConfig";
import { Skeleton } from "@/components/ui/skeleton";

const Loader = () => {
  return (
    <div key={0}>
      <div
        className="flex flex-row gl_loader justify-center py-6 text-sm text-secondary"
        key="loader"
      >
        Loading...
      </div>
    </div>
  );
};

export function PendingProposalsList() {
  const { signedAccountId } = useNear();

  const { config } = useProposalConfig();
  const isReviewer =
    signedAccountId && config?.reviewer_ids.includes(signedAccountId);

  const enabled = !!signedAccountId;

  const {
    data: proposals,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = usePendingProposals({
    enabled,
    pageSize: 10,
    createdBy: isReviewer ? undefined : signedAccountId,
  });

  const onLoadMore = useCallback(() => {
    if (!hasNextPage || isFetching || isFetchingNextPage) {
      return;
    }

    fetchNextPage();
  }, [hasNextPage, isFetching, isFetchingNextPage, fetchNextPage]);

  if (enabled && status === "pending") {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="w-full h-16" />
        <Skeleton className="w-full h-16" />
        <Skeleton className="w-full h-16" />
      </div>
    );
  }

  if (status === "error") {
    return <div>{error?.message}</div>;
  }

  if (!enabled || proposals?.length === 0) {
    return <div className="px-6 py-4">No pending proposals</div>;
  }

  return (
    <div>
      <InfiniteScroll
        hasMore={hasNextPage}
        loadMore={onLoadMore}
        initialLoad={false}
        element="main"
      >
        {proposals?.map((proposal) => (
          <PendingProposal key={proposal.id} proposal={proposal} />
        ))}
        {isFetchingNextPage && <Loader />}
      </InfiniteScroll>
    </div>
  );
}

export const PendingProposal = ({ proposal }: { proposal: Proposal }) => {
  return (
    <Link href={`/proposals/${proposal.proposalId}`}>
      <div className="border-b border-line items-center flex flex-row bg-neutral hover:bg-tertiary/20">
        <div
          className={cn(
            "flex flex-col whitespace-nowrap overflow-ellipsis overflow-hidden py-4 px-6",
            "w-full items-start justify-center"
          )}
        >
          <div className="text-xs text-secondary">
            Submitted by {proposal.creatorId}
          </div>
          <div className="overflow-ellipsis overflow-visible whitespace-normal break-words text-primary">
            {proposal.proposalTitle}
          </div>
        </div>
        <div className="flex-col whitespace-nowrap py-4 px-6 w-fit flex-start justify-center hidden sm:block">
          <div className="text-xs text-secondary">Submitted on</div>
          {proposal.createdAt && (
            <div className="overflow-ellipsis overflow-visible whitespace-normal break-words text-primary">
              {format(new Date(proposal.createdAt), "yyyy-MM-dd")}
            </div>
          )}
        </div>
        <div className="flex-col whitespace-nowrap py-4 px-6 w-fit flex-start justify-center hidden sm:block">
          <div className="text-xs text-secondary">Status</div>
          <div className="text-primary">Pending Approval</div>
        </div>
      </div>
    </Link>
  );
};
