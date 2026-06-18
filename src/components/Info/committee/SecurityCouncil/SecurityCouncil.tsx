"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useNear } from "@/contexts/NearContext";
import { InfoSearch } from "@/components/Info/shared/InfoSearch/InfoSearch";
import { InfoStatCard } from "@/components/Info/shared/InfoStatCard/InfoStatCard";
import { InfoMembersSidebar } from "@/components/Info/shared/InfoMembersSidebar/InfoMembersSidebar";
import { InfoClockIcon } from "@/components/Info/shared/InfoClockIcon/InfoClockIcon";
import { InfoNotificationBar } from "@/components/Info/shared/InfoNotificationBar/InfoNotificationBar";
import { InfoTabButton } from "@/components/Info/shared/InfoTabButton/InfoTabButton";
import { icons } from "@/assets/icons";
import { useCouncilMembers } from "@/hooks/useCouncilMembers";
import { useCouncilProposals } from "@/hooks/useCouncilProposals";
import type {
  CouncilActiveProposal,
  CouncilPassedProposal,
  CouncilVetoedProposal,
} from "@/lib/api/governance/types";
import {
  securityCouncilPageUiText,
  getInitials,
} from "@/components/Info/shared/uiText";

type ActionStatus = "No Veto Issued" | "Vetoed" | string;

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export const SecurityCouncil = () => {
  const router = useRouter();
  const { signedAccountId } = useNear();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "passed" | "vetoed">(
    "active"
  );
  const [activePage, setActivePage] = useState(1);
  const [passedPage, setPassedPage] = useState(1);
  const [vetoedPage, setVetoedPage] = useState(1);

  const { members, isLoading: membersLoading } = useCouncilMembers();
  const isMember = members?.some((m) => m.wallet === signedAccountId) ?? false;
  const isMemberView = isMember;

  const {
    proposals: activeProposals,
    stats: activeStats,
    count: activeCount,
    totalPages: activeTotalPages,
    isLoading: activeLoading,
  } = useCouncilProposals({
    status: "active",
    page: activePage,
    pageSize: 10,
    search: searchQuery || undefined,
    wallet: isMemberView ? signedAccountId : undefined,
  });

  const {
    proposals: passedProposals,
    count: passedCount,
    totalPages: passedTotalPages,
    isLoading: passedLoading,
  } = useCouncilProposals({
    status: "passed",
    page: passedPage,
    pageSize: 10,
    search: searchQuery || undefined,
  });

  const {
    proposals: vetoedProposals,
    count: vetoedCount,
    totalPages: vetoedTotalPages,
    isLoading: vetoedLoading,
  } = useCouncilProposals({
    status: "vetoed",
    page: vetoedPage,
    pageSize: 10,
    search: searchQuery || undefined,
  });

  const isActive = activeTab === "active";
  const isPassed = activeTab === "passed";
  const isVetoed = activeTab === "vetoed";

  const typedActive = (activeProposals ?? []) as CouncilActiveProposal[];
  const typedPassed = (passedProposals ?? []) as CouncilPassedProposal[];
  const typedVetoed = (vetoedProposals ?? []) as CouncilVetoedProposal[];

  const notificationMessage = (
    <>
      {securityCouncilPageUiText.notificationActivePrefix}{" "}
      <span className="font-bold">
        {activeStats?.activeCount ?? 0} proposals
      </span>{" "}
      {securityCouncilPageUiText.notificationActiveSuffix}
    </>
  );

  const getActionStatusClasses = (status: ActionStatus) => {
    if (status === "Vetoed") return "bg-red-100 text-red-700";
    return "bg-wash text-secondary";
  };

  const badgeBaseClass =
    "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium";

  const openDiscussion = (proposalId: string) => {
    router.push(`/proposals/security-council/${proposalId}?openComments=1`);
  };

  const sidebarMembers = (members ?? []).map((m) => ({
    initials: getInitials(m.name),
    name: m.name,
    subtitle: m.subtitle ?? "",
  }));

  const isLoading =
    (isActive && activeLoading) ||
    (isPassed && passedLoading) ||
    (isVetoed && vetoedLoading) ||
    membersLoading;

  const pageState = isActive
    ? { page: activePage, set: setActivePage, total: activeTotalPages }
    : isPassed
      ? { page: passedPage, set: setPassedPage, total: passedTotalPages }
      : { page: vetoedPage, set: setVetoedPage, total: vetoedTotalPages };

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
                {securityCouncilPageUiText.title}
              </h1>
              <p className="text-sm text-secondary sm:text-base">
                {securityCouncilPageUiText.description}
              </p>
              <Link
                href={securityCouncilPageUiText.learnMoreHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-tertiary hover:text-primary"
              >
                <span>{securityCouncilPageUiText.learnMoreLabel}</span>
                <Image
                  src={icons.northEast}
                  alt="Opens in a new tab"
                  className="h-3 w-3"
                />
              </Link>
            </div>

            <div className="flex gap-3 px-1 sm:px-0 overflow-x-auto sm:overflow-visible">
              <InfoStatCard
                value={String(activeStats?.activeCount ?? 0)}
                label={securityCouncilPageUiText.statsActiveWindowsLabel}
              />
              <InfoStatCard
                value={String(activeStats?.ratifiedAllTimeCount ?? 0)}
                label={securityCouncilPageUiText.statsRatifiedAllTimeLabel}
                variant="positive"
              />
              <InfoStatCard
                value={String(activeStats?.vetoedCount ?? 0)}
                label={securityCouncilPageUiText.statsVetoedLabel}
                variant="negative"
              />
            </div>
          </div>
        </header>

        {isMemberView && <InfoNotificationBar message={notificationMessage} />}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex-1 overflow-hidden rounded-2xl border border-line bg-neutral shadow-newDefault">
            <div className="border-b border-line">
              <div className="flex items-end justify-start gap-2 px-4 pt-3 pb-0">
                <InfoTabButton
                  label={securityCouncilPageUiText.tabActive}
                  isActive={isActive}
                  onClick={() => {
                    setActiveTab("active");
                    setActivePage(1);
                  }}
                  count={activeCount ?? 0}
                />
                <InfoTabButton
                  label={securityCouncilPageUiText.tabPassed}
                  isActive={isPassed}
                  onClick={() => {
                    setActiveTab("passed");
                    setPassedPage(1);
                  }}
                  count={passedCount ?? 0}
                />
                <InfoTabButton
                  label={securityCouncilPageUiText.tabVetoed}
                  isActive={isVetoed}
                  onClick={() => {
                    setActiveTab("vetoed");
                    setVetoedPage(1);
                  }}
                  count={vetoedCount ?? 0}
                  countActiveClassName="bg-red-600 text-neutral"
                  countInactiveClassName="bg-red-100 text-red-600"
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

              {!isLoading && isActive && (
                <>
                  {typedActive.length === 0 ? (
                    <div className="px-5 py-12 text-center text-sm text-tertiary">
                      No active proposals found.
                    </div>
                  ) : (
                    <>
                      <div className="px-4 py-1 sm:hidden">
                        {typedActive.map((window) => {
                          const clamped = clamp01(window.progressFraction);
                          const variant = clamped > 0.85 ? "danger" : "neutral";
                          return (
                            <div
                              key={window.proposalId}
                              className="block cursor-pointer border-b border-line bg-neutral px-2 py-3 text-sm text-left last:border-b-0 hover:bg-wash"
                              onClick={() =>
                                router.push(
                                  `/proposals/security-council/${window.proposalId}`
                                )
                              }
                            >
                              <p className="text-xs text-tertiary mb-1">
                                Passed delegate vote · {window.submittedBy}
                              </p>
                              <p className="font-semibold text-primary">
                                {window.proposalId}: {window.title}
                              </p>
                              <p className="mt-1 text-xs text-tertiary">
                                {window.votesSummary}
                              </p>
                              {isMemberView && (
                                <div className="mt-2">
                                  <span
                                    className={`${badgeBaseClass} ${getActionStatusClasses(window.actionStatus)}`}
                                  >
                                    {window.actionStatus}
                                  </span>
                                </div>
                              )}
                              <div className="mt-3 flex items-end justify-between gap-3">
                                <div className="flex flex-col items-start gap-2">
                                  <div className="flex items-center gap-1 text-sm font-semibold">
                                    {variant === "danger" && (
                                      <InfoClockIcon tone="danger" />
                                    )}
                                    <span
                                      className={
                                        variant === "danger"
                                          ? "text-red-600"
                                          : "text-primary"
                                      }
                                    >
                                      {window.timeRemaining}
                                    </span>
                                  </div>
                                  <div className="w-40 max-w-full">
                                    <div className="h-1.5 w-full rounded-full bg-line">
                                      <div
                                        className={`h-full rounded-full ${
                                          variant === "danger"
                                            ? "bg-red-600"
                                            : "bg-primary"
                                        }`}
                                        style={{
                                          width: `${clamped * 100}%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <p className="text-[11px] text-tertiary">
                                    {window.closesAt}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openDiscussion(window.proposalId);
                                    }}
                                    className="group ml-auto flex items-center gap-1 rounded-full px-1 py-1 text-sm"
                                  >
                                    <MessageCircle className="h-4 w-4 text-tertiary transition-colors group-hover:text-primary" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <p className="px-1 text-xs text-tertiary">
                          {securityCouncilPageUiText.activeInfo}
                        </p>
                      </div>

                      <div className="hidden sm:block">
                        <div className="flex items-center border-b border-line bg-wash px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.3px] text-tertiary">
                          <div className="flex-[2.7]">
                            {securityCouncilPageUiText.tableProposal}
                          </div>
                          <div className="flex-[2] text-center">
                            {securityCouncilPageUiText.tableVetoWindowCloses}
                          </div>
                          {isMemberView && (
                            <div className="flex-[1] text-center">
                              {securityCouncilPageUiText.tableAction}
                            </div>
                          )}
                          <div className="flex-[0.8] text-center">Comments</div>
                        </div>

                        {typedActive.map((window) => {
                          const clamped = clamp01(window.progressFraction);
                          const variant = clamped > 0.85 ? "danger" : "neutral";
                          return (
                            <div
                              key={window.proposalId}
                              className="flex cursor-pointer items-stretch border-b border-line px-5 py-4 text-sm hover:bg-wash"
                              onClick={() =>
                                router.push(
                                  `/proposals/security-council/${window.proposalId}`
                                )
                              }
                            >
                              <div className="flex flex-[2.7] flex-col gap-1">
                                <p className="text-xs text-tertiary">
                                  Passed delegate vote · {window.submittedBy}
                                </p>
                                <p className="font-semibold text-primary">
                                  {`${window.proposalId}: ${window.title}`}
                                </p>
                                <p className="text-xs text-tertiary">
                                  {window.votesSummary}
                                </p>
                              </div>
                              <div className="flex flex-[2] flex-col items-center gap-2">
                                <div className="flex items-center gap-1 text-sm font-semibold">
                                  {variant === "danger" && (
                                    <InfoClockIcon tone="danger" />
                                  )}
                                  <span
                                    className={
                                      variant === "danger"
                                        ? "text-red-600"
                                        : "text-primary"
                                    }
                                  >
                                    {window.timeRemaining}
                                  </span>
                                </div>
                                <div className="h-1.5 w-full max-w-[220px] rounded-full bg-line">
                                  <div
                                    className={`h-full rounded-full ${
                                      variant === "danger"
                                        ? "bg-red-600"
                                        : "bg-primary"
                                    }`}
                                    style={{
                                      width: `${clamped * 100}%`,
                                    }}
                                  />
                                </div>
                                <p className="text-xs text-tertiary">
                                  {window.closesAt}
                                </p>
                              </div>
                              {isMemberView && (
                                <div className="flex flex-[1] items-center justify-center">
                                  <span
                                    className={`${badgeBaseClass} ${getActionStatusClasses(window.actionStatus)}`}
                                  >
                                    {window.actionStatus}
                                  </span>
                                </div>
                              )}
                              <div className="flex flex-[0.8] items-center justify-center">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDiscussion(window.proposalId);
                                  }}
                                  className="group flex items-center justify-center gap-2 rounded-full px-2 py-1 text-sm"
                                >
                                  <MessageCircle className="h-4 w-4 text-tertiary transition-colors group-hover:text-primary" />
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        <div className="flex items-center gap-2 px-5 py-4 text-xs text-tertiary">
                          <InfoClockIcon />
                          <p>{securityCouncilPageUiText.activeInfo}</p>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {!isLoading && isPassed && (
                <>
                  {typedPassed.length === 0 ? (
                    <div className="px-5 py-12 text-center text-sm text-tertiary">
                      No passed proposals found.
                    </div>
                  ) : (
                    <>
                      <div className="px-4 py-1 sm:hidden">
                        {typedPassed.map((proposal) => (
                          <div
                            key={proposal.proposalId}
                            className="border-b border-line bg-neutral px-2 py-3 text-sm text-left last:border-b-0"
                          >
                            <p className="text-xs text-tertiary mb-1">
                              {proposal.submittedBy}
                            </p>
                            <p className="font-semibold text-primary">
                              {proposal.proposalId}: {proposal.title}
                            </p>
                            <p className="mt-1 text-xs text-tertiary">
                              {proposal.votesSummary}
                            </p>
                            <div className="mt-3 flex items-center justify-between gap-3">
                              <span
                                className={`${badgeBaseClass} bg-emerald-100 text-emerald-700`}
                              >
                                {securityCouncilPageUiText.ratifiedLabel}
                              </span>
                              <div className="text-right">
                                <p className="text-[11px] text-tertiary">
                                  Ratified on
                                </p>
                                <p className="text-xs text-tertiary">
                                  {proposal.ratifiedOn}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        <p className="px-1 text-xs text-tertiary">
                          {passedCount ?? 0}{" "}
                          {securityCouncilPageUiText.ratifiedSummarySuffix}
                        </p>
                      </div>

                      <div className="hidden sm:block">
                        <div className="flex items-center border-b border-line bg-wash px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.3px] text-tertiary">
                          <div className="flex-[3]">
                            {securityCouncilPageUiText.tableProposal}
                          </div>
                          <div className="flex-[1.5] text-center">
                            {securityCouncilPageUiText.tableOutcome}
                          </div>
                          <div className="flex-[1.5] text-center">
                            {securityCouncilPageUiText.tableRatifiedOn}
                          </div>
                        </div>

                        {typedPassed.map((proposal) => (
                          <div
                            key={proposal.proposalId}
                            className="flex items-stretch border-b border-line px-5 py-4 text-sm"
                          >
                            <div className="flex flex-[3] flex-col gap-1">
                              <p className="text-xs text-tertiary">
                                {proposal.submittedBy}
                              </p>
                              <p className="font-semibold text-primary">
                                {`${proposal.proposalId}: ${proposal.title}`}
                              </p>
                              <p className="text-xs text-tertiary">
                                {proposal.votesSummary}
                              </p>
                            </div>
                            <div className="flex flex-[1.5] items-center justify-center">
                              <span
                                className={`${badgeBaseClass} bg-emerald-100 text-emerald-700`}
                              >
                                {securityCouncilPageUiText.ratifiedLabel}
                              </span>
                            </div>
                            <div className="flex flex-[1.5] items-center justify-center text-xs text-tertiary">
                              {proposal.ratifiedOn}
                            </div>
                          </div>
                        ))}

                        <div className="px-5 py-4 text-xs text-tertiary">
                          {passedCount ?? 0}{" "}
                          {securityCouncilPageUiText.ratifiedSummarySuffix}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {!isLoading && isVetoed && (
                <>
                  {typedVetoed.length === 0 ? (
                    <div className="px-5 py-12 text-center text-sm text-tertiary">
                      No vetoed proposals found.
                    </div>
                  ) : (
                    <>
                      <div className="px-4 py-1 sm:hidden">
                        {typedVetoed.map((proposal) => {
                          const authorInitials = proposal.rationaleAuthor
                            ? getInitials(proposal.rationaleAuthor.name)
                            : "??";
                          return (
                            <Link
                              key={proposal.proposalId}
                              href={`/proposals/security-council/${proposal.proposalId}?openComments=1`}
                              className="block border-b border-line bg-neutral px-2 py-3 text-sm text-left last:border-b-0 hover:bg-wash"
                            >
                              <p className="text-xs text-tertiary mb-1">
                                {proposal.submittedBy}
                              </p>
                              <p className="font-semibold text-primary">
                                {proposal.proposalId}: {proposal.title}
                              </p>
                              <p className="mt-1 text-xs text-tertiary">
                                {proposal.votesSummary}
                              </p>
                              <div className="mt-3 flex items-center justify-between gap-3">
                                <span
                                  className={`${badgeBaseClass} bg-red-100 text-red-700`}
                                >
                                  Vetoed
                                </span>
                                <div className="text-right text-xs text-tertiary">
                                  <p className="text-[11px]">Vetoed on</p>
                                  <p>{proposal.vetoedOn}</p>
                                </div>
                              </div>
                              {proposal.rationaleAuthor && (
                                <div className="mt-3 flex items-center gap-2 text-xs">
                                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-neutral">
                                    {authorInitials}
                                  </span>
                                  <span className="font-medium text-secondary">
                                    {proposal.rationaleAuthor.name}
                                  </span>
                                  <span className="ml-auto text-tertiary">
                                    ›
                                  </span>
                                </div>
                              )}
                            </Link>
                          );
                        })}
                        <p className="px-1 text-xs text-tertiary">
                          {vetoedCount ?? 0} proposal
                          {(vetoedCount ?? 0) === 1 ? "" : "s"}{" "}
                          {securityCouncilPageUiText.vetoedSummarySuffix}
                        </p>
                      </div>

                      <div className="hidden sm:block">
                        <div className="flex items-center border-b border-line bg-wash px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.3px] text-tertiary">
                          <div className="flex-[3]">
                            {securityCouncilPageUiText.tableProposal}
                          </div>
                          <div className="flex-[1.2] text-center">
                            {securityCouncilPageUiText.tableOutcome}
                          </div>
                          <div className="flex-[1.2] text-center">
                            {securityCouncilPageUiText.tableVetoedOn}
                          </div>
                          <div className="flex-[1.6] text-center">
                            {securityCouncilPageUiText.tableRationale}
                          </div>
                        </div>

                        {typedVetoed.map((proposal) => {
                          const authorInitials = proposal.rationaleAuthor
                            ? getInitials(proposal.rationaleAuthor.name)
                            : "??";
                          return (
                            <Link
                              key={proposal.proposalId}
                              href={`/proposals/security-council/${proposal.proposalId}?openComments=1`}
                              className="flex items-stretch border-b border-line px-5 py-4 text-sm hover:bg-wash"
                            >
                              <div className="flex flex-[3] flex-col gap-1">
                                <p className="text-xs text-tertiary">
                                  {proposal.submittedBy}
                                </p>
                                <p className="font-semibold text-primary">
                                  {`${proposal.proposalId}: ${proposal.title}`}
                                </p>
                                <p className="text-xs text-tertiary">
                                  {proposal.votesSummary}
                                </p>
                              </div>
                              <div className="flex flex-[1.2] items-center justify-center">
                                <span
                                  className={`${badgeBaseClass} bg-red-100 text-red-700`}
                                >
                                  Vetoed
                                </span>
                              </div>
                              <div className="flex flex-[1.2] items-center justify-center text-xs text-tertiary">
                                {proposal.vetoedOn}
                              </div>
                              <div className="flex flex-[1.6] items-center justify-center text-sm">
                                {proposal.rationaleAuthor && (
                                  <span className="flex items-center gap-2 text-xs text-tertiary">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-neutral">
                                      {authorInitials}
                                    </span>
                                    <span className="font-medium text-secondary">
                                      {proposal.rationaleAuthor.name}
                                    </span>
                                    <span aria-hidden className="text-tertiary">
                                      ›
                                    </span>
                                  </span>
                                )}
                              </div>
                            </Link>
                          );
                        })}

                        <div className="px-5 py-4 text-xs text-tertiary">
                          {vetoedCount ?? 0} proposal
                          {(vetoedCount ?? 0) === 1 ? "" : "s"}{" "}
                          {securityCouncilPageUiText.vetoedSummarySuffix}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {!isLoading && (pageState.total ?? 0) > 1 && (
                <div className="flex items-center justify-center gap-2 border-t border-line px-5 py-3">
                  <button
                    type="button"
                    disabled={pageState.page <= 1}
                    onClick={() => pageState.set((p) => Math.max(1, p - 1))}
                    className="rounded-lg border border-line px-3 py-1 text-xs font-medium text-secondary hover:bg-wash disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-tertiary">
                    Page {pageState.page} of {pageState.total}
                  </span>
                  <button
                    type="button"
                    disabled={pageState.page >= (pageState.total ?? 1)}
                    onClick={() => pageState.set((p) => p + 1)}
                    className="rounded-lg border border-line px-3 py-1 text-xs font-medium text-secondary hover:bg-wash disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          <InfoMembersSidebar
            title={securityCouncilPageUiText.membersSidebarTitle}
            members={sidebarMembers}
            footerText={securityCouncilPageUiText.membersSidebarFooter}
          />
        </div>
      </div>
    </section>
  );
};
