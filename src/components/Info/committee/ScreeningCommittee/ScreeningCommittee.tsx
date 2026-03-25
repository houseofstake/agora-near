"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { icons } from "@/assets/icons";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNear } from "@/contexts/NearContext";
import { InfoSearch } from "@/components/Info/shared/InfoSearch/InfoSearch";
import { InfoStatCard } from "@/components/Info/shared/InfoStatCard/InfoStatCard";
import { InfoMembersSidebar } from "@/components/Info/shared/InfoMembersSidebar/InfoMembersSidebar";
import { InfoNotificationBar } from "@/components/Info/shared/InfoNotificationBar/InfoNotificationBar";
import { InfoTabButton } from "@/components/Info/shared/InfoTabButton/InfoTabButton";
import { useScreeningMembers } from "@/hooks/useScreeningMembers";
import { useScreeningProposals } from "@/hooks/useScreeningProposals";
import type {
  ScreeningCurrentProposal,
  ScreeningIncomingProposal,
  ScreeningPastProposal,
} from "@/lib/api/governance/types";
import {
  screeningCommitteePageUiText,
  getInitials,
} from "@/components/Info/shared/uiText";

type VoteBadge = "Passed" | "Rejected" | "Vote pending";

const mapMyVote = (v: "APPROVE" | "REJECT" | null): VoteBadge => {
  if (v === "APPROVE") return "Passed";
  if (v === "REJECT") return "Rejected";
  return "Vote pending";
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const isSafeExternalUrl = (url: string | null): url is string => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
};

export const ScreeningCommittee = () => {
  const router = useRouter();
  const { signedAccountId } = useNear();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"current" | "incoming" | "past">(
    "current"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [incomingPage, setIncomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);

  const { members, isLoading: membersLoading } = useScreeningMembers();
  const isMember = members?.some((m) => m.wallet === signedAccountId) ?? false;
  const isMemberView = isMember;

  const {
    proposals: currentProposals,
    stats: currentStats,
    count: currentCount,
    totalPages: currentTotalPages,
    isLoading: currentLoading,
  } = useScreeningProposals({
    status: "current",
    page: currentPage,
    pageSize: 10,
    search: searchQuery || undefined,
    wallet: isMemberView ? signedAccountId : undefined,
  });

  const {
    proposals: incomingProposals,
    count: incomingCount,
    totalPages: incomingTotalPages,
    isLoading: incomingLoading,
  } = useScreeningProposals({
    status: "incoming",
    page: incomingPage,
    pageSize: 10,
    search: searchQuery || undefined,
  });

  const {
    proposals: pastProposals,
    count: pastCount,
    totalPages: pastTotalPages,
    isLoading: pastLoading,
  } = useScreeningProposals({
    status: "past",
    page: pastPage,
    pageSize: 10,
    search: searchQuery || undefined,
  });

  const isCurrent = activeTab === "current";
  const isIncoming = activeTab === "incoming";
  const isPast = activeTab === "past";

  const typedCurrent = (currentProposals ?? []) as ScreeningCurrentProposal[];
  const typedIncoming = (incomingProposals ??
    []) as ScreeningIncomingProposal[];
  const typedPast = (pastProposals ?? []) as ScreeningPastProposal[];

  const pendingCount = currentStats?.pendingCount ?? 0;

  const notificationMessage = (
    <>
      {screeningCommitteePageUiText.notificationAwaitingPrefix}{" "}
      <span className="font-bold">{pendingCount} proposals</span>{" "}
      {screeningCommitteePageUiText.notificationAwaitingSuffix}
    </>
  );

  const getVoteStatusClasses = (status: VoteBadge) => {
    if (status === "Passed") return "bg-emerald-100 text-emerald-700";
    if (status === "Rejected") return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  };

  const badgeBaseClass =
    "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium";

  const openDiscussion = (proposalId: string) => {
    router.push(`/proposals/screening-committee/${proposalId}?openComments=1`);
  };

  const sidebarMembers = (members ?? []).map((m) => ({
    initials: getInitials(m.name),
    name: m.name,
    subtitle: m.subtitle ?? "",
  }));

  const isLoading =
    (isCurrent && currentLoading) ||
    (isIncoming && incomingLoading) ||
    (isPast && pastLoading) ||
    membersLoading;

  const activePageSetter = isCurrent
    ? setCurrentPage
    : isIncoming
      ? setIncomingPage
      : setPastPage;
  const activeTotalPages = isCurrent
    ? currentTotalPages
    : isIncoming
      ? incomingTotalPages
      : pastTotalPages;
  const activeCurrentPage = isCurrent
    ? currentPage
    : isIncoming
      ? incomingPage
      : pastPage;

  return (
    <section className="mt-10 mb-16">
      <div className="mx-auto max-w-desktop space-y-6 sm:space-y-10">
        <header className="space-y-6 pb-3 sm:pb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/info"
              className="inline-flex items-center gap-2 text-sm text-tertiary hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <h1 className="text-3xl font-black leading-tight text-primary sm:text-[32px] sm:leading-[36px]">
                {screeningCommitteePageUiText.title}
              </h1>
              <p className="text-sm text-secondary sm:text-base">
                {screeningCommitteePageUiText.description}
              </p>
              <Link
                href={screeningCommitteePageUiText.learnMoreHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-tertiary hover:text-primary"
              >
                <span>{screeningCommitteePageUiText.learnMoreLabel}</span>
                <Image
                  src={icons.northEast}
                  alt="Opens in a new tab"
                  className="h-3 w-3"
                />
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 px-1 sm:px-0">
              <InfoStatCard
                value={String(currentStats?.pendingCount ?? 0)}
                label={screeningCommitteePageUiText.statsPendingReviewLabel}
              />
              <InfoStatCard
                value={String(currentStats?.incomingCount ?? 0)}
                label={screeningCommitteePageUiText.statsIncomingLabel}
              />
              <InfoStatCard
                value={String(currentStats?.approvedAllTimeCount ?? 0)}
                label={screeningCommitteePageUiText.statsApprovedAllTimeLabel}
                variant="positive"
              />
            </div>
          </div>
        </header>

        {isMemberView && <InfoNotificationBar message={notificationMessage} />}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex-1">
            <div className="overflow-hidden rounded-2xl border border-line bg-neutral shadow-newDefault">
              <div className="border-b border-line">
                <div className="flex items-end justify-start gap-2 px-4 pt-3 pb-0">
                  <InfoTabButton
                    label={screeningCommitteePageUiText.tabCurrent}
                    isActive={isCurrent}
                    onClick={() => {
                      setActiveTab("current");
                      setCurrentPage(1);
                    }}
                    count={currentCount ?? 0}
                  />
                  <InfoTabButton
                    label={screeningCommitteePageUiText.tabIncoming}
                    isActive={isIncoming}
                    onClick={() => {
                      setActiveTab("incoming");
                      setIncomingPage(1);
                    }}
                    count={incomingCount ?? 0}
                  />
                  <InfoTabButton
                    label={screeningCommitteePageUiText.tabPast}
                    isActive={isPast}
                    onClick={() => {
                      setActiveTab("past");
                      setPastPage(1);
                    }}
                  />
                  <div className="ml-auto mb-1 hidden sm:block">
                    <InfoSearch
                      placeholder="Search proposals"
                      value={searchQuery}
                      onChange={setSearchQuery}
                    />
                  </div>
                </div>
              </div>

              <div className="px-4 py-2 sm:hidden">
                <InfoSearch
                  placeholder="Search proposals"
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
              </div>

              <div>
                {isLoading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-primary" />
                  </div>
                )}

                {!isLoading && isCurrent && (
                  <>
                    {typedCurrent.length === 0 ? (
                      <div className="px-5 py-12 text-center text-sm text-tertiary">
                        No current proposals found.
                      </div>
                    ) : (
                      <>
                        <div className="px-4 py-1 sm:hidden">
                          {typedCurrent.map((proposal) => {
                            const voteBadge = mapMyVote(proposal.myVote);
                            return (
                              <div
                                key={proposal.proposalId}
                                className="border-b border-line bg-neutral px-2 py-3 text-sm text-left last:border-b-0 cursor-pointer hover:bg-wash"
                                onClick={() =>
                                  router.push(
                                    `/proposals/screening-committee/${proposal.proposalId}`
                                  )
                                }
                              >
                                <p className="text-xs text-tertiary mb-1">
                                  Submitted by {proposal.submittedBy}
                                </p>
                                <p className="font-semibold text-primary">
                                  {proposal.proposalId}: {proposal.title}
                                </p>
                                <div className="mt-2">
                                  {isMemberView && (
                                    <span
                                      className={`${badgeBaseClass} ${getVoteStatusClasses(voteBadge)}`}
                                    >
                                      My vote: {voteBadge}
                                    </span>
                                  )}
                                </div>
                                <div className="mt-3 flex items-center justify-between gap-3">
                                  <div className="flex flex-col items-start gap-1">
                                    <p className="text-sm font-semibold text-primary">
                                      {proposal.timeRemaining}
                                    </p>
                                    <div className="w-40 max-w-full">
                                      <div className="h-1 w-full rounded-full bg-line">
                                        <div
                                          className="h-full rounded-full bg-primary"
                                          style={{
                                            width: `${clamp01(proposal.progressFraction) * 100}%`,
                                          }}
                                        />
                                      </div>
                                    </div>
                                    <p className="text-[11px] text-tertiary">
                                      Time remaining
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(
                                        `/proposals/screening-committee/${proposal.proposalId}?openComments=1`
                                      );
                                    }}
                                    className="group flex items-center gap-1 rounded-full px-2 py-1 text-sm"
                                  >
                                    <MessageCircle className="h-4 w-4 text-tertiary group-hover:text-primary transition-colors" />
                                    <span className="font-medium text-secondary">
                                      {proposal.commentsCount}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="hidden sm:block">
                          <div className="flex items-center border-b border-line bg-wash px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.3px] text-tertiary">
                            <div className="flex-[2.7]">
                              {screeningCommitteePageUiText.tableProposal}
                            </div>
                            <div className="flex-[1.5] text-center">
                              {screeningCommitteePageUiText.tableTimeRemaining}
                            </div>
                            {isMemberView && (
                              <div className="flex-[1] text-center">
                                {screeningCommitteePageUiText.tableMyVote}
                              </div>
                            )}
                            <div className="flex-[0.8] text-center">
                              {screeningCommitteePageUiText.tableComments}
                            </div>
                          </div>

                          {typedCurrent.map((proposal) => {
                            const voteBadge = mapMyVote(proposal.myVote);
                            return (
                              <div
                                key={proposal.proposalId}
                                className="flex items-center border-b border-line px-5 py-4 text-sm cursor-pointer hover:bg-wash"
                                onClick={() =>
                                  router.push(
                                    `/proposals/screening-committee/${proposal.proposalId}`
                                  )
                                }
                              >
                                <div className="flex flex-[2.7] flex-col gap-1">
                                  <p className="text-xs text-tertiary">
                                    Submitted by {proposal.submittedBy}
                                  </p>
                                  <p className="font-semibold text-primary">{`${proposal.proposalId}: ${proposal.title}`}</p>
                                </div>
                                <div className="flex flex-[1.5] flex-col items-center gap-2">
                                  <p className="text-sm font-semibold text-primary">
                                    {proposal.timeRemaining}
                                  </p>
                                  <div className="h-1 w-full max-w-[180px] rounded-full bg-line">
                                    <div
                                      className="h-full rounded-full bg-primary"
                                      style={{
                                        width: `${clamp01(proposal.progressFraction) * 100}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                                {isMemberView && (
                                  <div className="flex flex-[1] items-center justify-center">
                                    <span
                                      className={`${badgeBaseClass} ${getVoteStatusClasses(voteBadge)}`}
                                    >
                                      {voteBadge}
                                    </span>
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(
                                      `/proposals/screening-committee/${proposal.proposalId}?openComments=1`
                                    );
                                  }}
                                  className="group flex flex-[0.8] items-center justify-center gap-2 rounded-full px-2 py-1 text-sm"
                                >
                                  <MessageCircle className="h-4 w-4 text-tertiary group-hover:text-primary transition-colors" />
                                  <span className="font-medium text-secondary">
                                    {proposal.commentsCount}
                                  </span>
                                </button>
                              </div>
                            );
                          })}

                          <div className="px-5 py-4 text-xs text-tertiary">
                            {
                              screeningCommitteePageUiText.showingActiveReviewPrefix
                            }{" "}
                            {currentCount ?? 0}{" "}
                            {
                              screeningCommitteePageUiText.showingActiveReviewSuffix
                            }
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}

                {!isLoading && isIncoming && (
                  <>
                    {typedIncoming.length === 0 ? (
                      <div className="px-5 py-12 text-center text-sm text-tertiary">
                        No incoming proposals found.
                      </div>
                    ) : (
                      <>
                        <div className="px-4 py-1 sm:hidden">
                          {typedIncoming.map((proposal) => (
                            <div
                              key={proposal.id}
                              className="border-b border-line bg-neutral px-2 py-3 text-sm text-left last:border-b-0"
                            >
                              <p className="text-xs text-tertiary mb-1">
                                Posted by {proposal.submittedBy}
                              </p>
                              <p className="font-semibold text-primary">
                                {proposal.title}
                              </p>
                              <div className="mt-3 flex items-center justify-between gap-3">
                                <span className="inline-flex items-center rounded-full border border-line bg-wash px-3 py-0.5 text-xs font-semibold text-secondary">
                                  Forum
                                </span>
                                {isSafeExternalUrl(proposal.forumLink) && (
                                  <Link
                                    href={proposal.forumLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-medium text-secondary hover:text-primary"
                                  >
                                    <span>View on Forum</span>
                                    <Image
                                      src={icons.northEast}
                                      alt="Opens in a new tab"
                                      className="h-3 w-3"
                                    />
                                  </Link>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="hidden sm:block">
                          <div className="flex items-center border-b border-line bg-wash px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.3px] text-tertiary">
                            <div className="flex-[3]">
                              {screeningCommitteePageUiText.tableProposal}
                            </div>
                            <div className="flex-[1] text-center">
                              {screeningCommitteePageUiText.tableType}
                            </div>
                            <div className="flex-[1.5] text-center">
                              {screeningCommitteePageUiText.tableLink}
                            </div>
                          </div>

                          {typedIncoming.map((proposal) => (
                            <div
                              key={proposal.id}
                              className="flex items-center border-b border-line px-5 py-4 text-sm"
                            >
                              <div className="flex flex-[3] flex-col gap-1">
                                <p className="text-xs text-tertiary">
                                  Posted by {proposal.submittedBy}
                                </p>
                                <p className="font-semibold text-primary">
                                  {proposal.title}
                                </p>
                              </div>
                              <div className="flex flex-[1] items-center justify-center">
                                <span className="inline-flex items-center rounded-full border border-line bg-wash px-3 py-1 text-xs font-semibold text-secondary">
                                  {screeningCommitteePageUiText.forumTag}
                                </span>
                              </div>
                              <div className="flex flex-[1.5] items-center justify-center">
                                {isSafeExternalUrl(proposal.forumLink) && (
                                  <Link
                                    href={proposal.forumLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm font-medium text-secondary hover:text-primary"
                                  >
                                    <span>
                                      {
                                        screeningCommitteePageUiText.forumViewLabel
                                      }
                                    </span>
                                    <Image
                                      src={icons.northEast}
                                      alt="Opens in a new tab"
                                      className="h-3 w-3"
                                    />
                                  </Link>
                                )}
                              </div>
                            </div>
                          ))}

                          <div className="px-5 py-4 text-xs text-tertiary">
                            {screeningCommitteePageUiText.incomingInfo}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}

                {!isLoading && isPast && (
                  <>
                    {typedPast.length === 0 ? (
                      <div className="px-5 py-12 text-center text-sm text-tertiary">
                        No past proposals found.
                      </div>
                    ) : (
                      <>
                        <div className="px-4 py-1 sm:hidden">
                          {typedPast.map((proposal) => (
                            <Link
                              key={`${proposal.proposalId}-${proposal.decidedAt}`}
                              href={`/proposals/screening-committee/${proposal.proposalId}`}
                              className="block border-b border-line bg-neutral px-2 py-3 text-sm text-left last:border-b-0 hover:bg-wash"
                            >
                              <p className="text-xs text-tertiary mb-1">
                                Submitted by {proposal.submittedBy}
                              </p>
                              <p className="font-semibold text-primary">
                                {proposal.proposalId}: {proposal.title}
                              </p>
                              <div className="mt-3 flex items-center justify-between gap-3">
                                <div className="flex-1">
                                  <p className="text-[11px] text-tertiary">
                                    Decided
                                  </p>
                                  <p className="text-xs text-tertiary">
                                    {proposal.decidedAt}
                                  </p>
                                </div>
                                <div className="flex-1 flex justify-center">
                                  <span
                                    className={`${badgeBaseClass} ${
                                      proposal.status === "APPROVED"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {proposal.status === "APPROVED"
                                      ? "Approved"
                                      : "Rejected"}
                                  </span>
                                </div>
                                <div
                                  className="group flex items-center gap-1 rounded-full px-2 py-1 text-sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    openDiscussion(proposal.proposalId);
                                  }}
                                >
                                  <MessageCircle className="h-4 w-4 text-tertiary group-hover:text-primary transition-colors" />
                                  <span className="font-medium text-secondary">
                                    {proposal.commentsCount}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>

                        <div className="hidden sm:block">
                          <div className="flex items-center border-b border-line bg-wash px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.3px] text-tertiary">
                            <div className="flex-[3]">
                              {screeningCommitteePageUiText.tableProposal}
                            </div>
                            <div className="flex-[1] text-center">
                              {screeningCommitteePageUiText.tableDecision}
                            </div>
                            <div className="flex-[1] text-center">
                              {screeningCommitteePageUiText.tableDecided}
                            </div>
                            <div className="flex-[1] text-center">
                              {screeningCommitteePageUiText.tableComments}
                            </div>
                          </div>

                          {typedPast.map((proposal) => (
                            <Link
                              key={`${proposal.proposalId}-${proposal.decidedAt}`}
                              href={`/proposals/screening-committee/${proposal.proposalId}`}
                              className="flex items-center border-b border-line px-5 py-4 text-sm hover:bg-wash"
                            >
                              <div className="flex flex-[3] flex-col gap-1">
                                <p className="text-xs text-tertiary">
                                  Submitted by {proposal.submittedBy}
                                </p>
                                <p className="font-semibold text-primary">
                                  {`${proposal.proposalId}: ${proposal.title}`}
                                </p>
                              </div>
                              <div className="flex flex-[1] items-center justify-center">
                                {proposal.status === "APPROVED" ? (
                                  <span
                                    className={`${badgeBaseClass} bg-emerald-100 text-emerald-700`}
                                  >
                                    Approved
                                  </span>
                                ) : (
                                  <span
                                    className={`${badgeBaseClass} bg-red-100 text-red-700`}
                                  >
                                    Rejected
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-[1] items-center justify-center text-xs text-tertiary">
                                {proposal.decidedAt}
                              </div>
                              <div
                                className="group flex flex-[1] items-center justify-center gap-2 rounded-full px-2 py-1 text-sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openDiscussion(proposal.proposalId);
                                }}
                              >
                                <MessageCircle className="h-4 w-4 text-tertiary group-hover:text-primary transition-colors" />
                                <span className="font-medium text-secondary">
                                  {proposal.commentsCount}
                                </span>
                              </div>
                            </Link>
                          ))}

                          <div className="px-5 py-4 text-xs text-tertiary">
                            {screeningCommitteePageUiText.pastInfoPrefix}{" "}
                            {pastCount ?? 0}{" "}
                            {screeningCommitteePageUiText.pastInfoSuffix}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}

                {!isLoading && (activeTotalPages ?? 0) > 1 && (
                  <div className="flex items-center justify-center gap-2 border-t border-line px-5 py-3">
                    <button
                      type="button"
                      disabled={activeCurrentPage <= 1}
                      onClick={() =>
                        activePageSetter((p) => Math.max(1, p - 1))
                      }
                      className="rounded-lg border border-line px-3 py-1 text-xs font-medium text-secondary hover:bg-wash disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-tertiary">
                      Page {activeCurrentPage} of {activeTotalPages}
                    </span>
                    <button
                      type="button"
                      disabled={activeCurrentPage >= (activeTotalPages ?? 1)}
                      onClick={() => activePageSetter((p) => p + 1)}
                      className="rounded-lg border border-line px-3 py-1 text-xs font-medium text-secondary hover:bg-wash disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <InfoMembersSidebar
            title={screeningCommitteePageUiText.membersSidebarTitle}
            members={sidebarMembers}
            footerText={screeningCommitteePageUiText.membersSidebarFooter}
          />
        </div>
      </div>
    </section>
  );
};
