"use client";

import { UpdatedButton } from "@/components/Button";
import PageHeader from "@/components/Layout/PageHeader/PageHeader";
import { useApprovedProposals } from "@/hooks/useApprovedProposals";
import {
  useCreateDraftProposal,
  useDraftProposals,
} from "@/hooks/useDraftProposals";
import { usePendingProposals } from "@/hooks/usePendingProposals";
import { useNear } from "@/contexts/NearContext";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
const InfiniteScrollAny = InfiniteScroll as any;
import { Proposal } from "./Proposal";
import { PendingProposalsList } from "./PendingProposals";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { DraftProposalsList } from "./DraftProposalsList";
import { toast } from "react-hot-toast";
import { useProposalConfig } from "@/hooks/useProposalConfig";

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

function NearProposalsList() {
  const {
    proposals,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
    isLoading,
  } = useApprovedProposals({ pageSize: 10 });

  const onLoadMore = useCallback(() => {
    if (!hasNextPage || isFetching || isFetchingNextPage) {
      return;
    }

    fetchNextPage();
  }, [hasNextPage, isFetching, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
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

  return (
    <div>
      <InfiniteScrollAny
        hasMore={hasNextPage}
        loadMore={onLoadMore}
        initialLoad={false}
        element="main"
      >
        {proposals?.map((proposal) => (
          <Proposal key={proposal.id} proposal={proposal} />
        ))}
        {isFetchingNextPage && <Loader />}
      </InfiniteScrollAny>
    </div>
  );
}

enum Tab {
  All = "All",
  Pending = "Pending Proposals",
  Drafts = "Drafts",
}

export default function NearProposals() {
  const router = useRouter();
  const { signedAccountId, signIn } = useNear();

  const [activeTab, setActiveTab] = useState(Tab.All);

  const { mutate: createDraft, isPending: isCreatingDraft } =
    useCreateDraftProposal();

  const { config } = useProposalConfig();
  const isReviewer =
    signedAccountId && config?.reviewer_ids.includes(signedAccountId);

  const { data: pendingProposals } = usePendingProposals({
    enabled: !!signedAccountId,
    pageSize: 10,
    createdBy: isReviewer ? undefined : signedAccountId,
  });

  const { data: draftProposals } = useDraftProposals({
    author: signedAccountId || undefined,
  });

  const hasPendingProposals =
    isReviewer || (pendingProposals && pendingProposals.length > 0);
  const hasDraftProposals =
    draftProposals?.draftProposals && draftProposals.draftProposals.length > 0;

  const availableTabs = [
    Tab.All,
    ...(hasPendingProposals ? [Tab.Pending] : []),
    ...(hasDraftProposals ? [Tab.Drafts] : []),
  ];

  const shouldShowTabs = availableTabs.length > 1;

  const onCreateProposalClicked = () => {
    if (!signedAccountId) {
      signIn();
      return;
    }

    createDraft(
      {
        author: signedAccountId,
      },
      {
        onSuccess: (draft) => {
          router.push(`/proposals/drafts/${draft.id}`);
        },
        onError: (error) => {
          toast.error("Failed to create draft proposal");
          console.error(error);
        },
      }
    );
  };

  return (
    <div className="flex flex-col max-w-[76rem]">
      <div className="flex flex-col sm:flex-row justify-between items-baseline gap-2 mb-4 sm:mb-auto">
        <div className="flex flex-row justify-between w-full gap-4 items-center mb-4">
          <PageHeader headerText="Proposals" />
          <UpdatedButton
            onClick={onCreateProposalClicked}
            disabled={isCreatingDraft}
          >
            {isCreatingDraft ? "Creating..." : "Create Proposal"}
          </UpdatedButton>
        </div>
      </div>
      <div className="flex flex-col bg-neutral border border-line rounded-lg shadow-newDefault overflow-hidden">
        {shouldShowTabs && (
          <div className="border-b border-line items-center flex flex-row bg-neutral px-6">
            {availableTabs.map((tab) => (
              <button
                key={tab}
                className={cn(
                  "text-sm text-secondary px-4 py-4",
                  activeTab === tab && "border-primary border-b"
                )}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
        {(!shouldShowTabs || activeTab === Tab.All) && <NearProposalsList />}
        {hasPendingProposals && activeTab === Tab.Pending && (
          <PendingProposalsList />
        )}
        {hasDraftProposals && activeTab === Tab.Drafts && (
          <DraftProposalsList />
        )}
      </div>
    </div>
  );
}
