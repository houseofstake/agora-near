"use client";

import Image from "next/image";
import { Info, Pencil, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { icons } from "@/assets/icons";
import {
  ProposalTimelineView,
  type ProposalTimelineRow,
} from "@/components/Proposals/InfoExpansion/ProposalTimelineView";
import { ProposalVisualizationCard } from "@/components/Proposals/InfoExpansion/ProposalVisualizationCard";
import { ProposalReviewStatusCard } from "@/components/Proposals/InfoExpansion/ProposalReviewStatusCard";
import {
  ProposalReviewMembersList,
  type ProposalReviewMemberItem,
} from "@/components/Proposals/InfoExpansion/ProposalReviewMembersList";
import { ProposalTypeBadge } from "@/components/Proposals/ProposalTypeBadge";
import { ProposalType, decodeMetadata } from "@/lib/proposalMetadata";
import Markdown from "@/components/shared/Markdown/Markdown";
import { useScreeningProposalDetail } from "@/hooks/useScreeningProposalDetail";
import { useSubmitScreeningReview } from "@/hooks/useSubmitScreeningReview";
import { useNear } from "@/contexts/NearContext";
import {
  screeningExpansionUiText,
  getInitials,
  stripLeadingJsonMetadata,
  buildProposalTypeMarkdown,
} from "@/components/Info/shared/uiText";

type ScreeningProposalExpansionPageProps = {
  proposalId: string;
  openComments?: boolean;
};

type DiscussionItem = {
  id: string;
  initials: string;
  name: string;
  subtitle: string;
  date: string;
  body: string;
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export const ScreeningProposalExpansionPage = ({
  proposalId,
  openComments = false,
}: ScreeningProposalExpansionPageProps) => {
  const { signedAccountId } = useNear();
  const {
    proposal: proposalData,
    governanceStatus,
    reviews,
    members: detailMembers,
    isLoading,
  } = useScreeningProposalDetail(proposalId);
  const {
    submitReview,
    isSubmitting,
    error: submitError,
  } = useSubmitScreeningReview(proposalId);

  const isMember =
    detailMembers?.some((m) => m.wallet === signedAccountId) ?? false;
  const isMemberView = isMember;
  const commentsRef = useRef<HTMLDivElement | null>(null);
  const [activeView, setActiveView] = useState<
    "proposal" | "timeline" | "discussion"
  >(openComments ? "discussion" : "proposal");

  const title = proposalData
    ? `${proposalData.proposalId}: ${proposalData.title ?? "Untitled"}`
    : `${proposalId}: Screening proposal`;
  const proposalAuthor = proposalData?.submittedBy ?? "unknown.near";
  const { description: rawDescription, metadata } = decodeMetadata(
    proposalData?.description ?? ""
  );
  const { description: cleanDescription, v0Meta } =
    stripLeadingJsonMetadata(rawDescription);
  const proposalTypeMd = buildProposalTypeMarkdown(
    v0Meta,
    metadata.proposalType
  );
  const fullDescription = proposalTypeMd
    ? `${cleanDescription}\n\n${proposalTypeMd}`
    : cleanDescription;

  const [discussionItems, setDiscussionItems] = useState<DiscussionItem[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (reviews) {
      setDiscussionItems(
        reviews.map((review) => ({
          id: review.id,
          initials: getInitials(review.member.name),
          name: review.member.name,
          subtitle: review.member.subtitle ?? "",
          date: review.createdAt,
          body: review.rationale ?? "",
        }))
      );
    }
  }, [reviews]);

  useEffect(() => {
    if (!openComments) return;
    setActiveView("discussion");
    commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [openComments]);

  const reviewActions = new Map(
    (reviews ?? []).map((r) => [r.member.id, r.action])
  );
  const reviewMembers = (detailMembers ?? []).map((member) => {
    const action = reviewActions.get(member.id);
    let status = "Pending";
    if (action === "APPROVE") status = "Approve";
    else if (action === "REJECT") status = "Reject";
    return { ...member, status };
  });

  const approvedCount = reviewMembers.filter(
    (m) => m.status === "Approve"
  ).length;
  const pendingCount = reviewMembers.filter(
    (m) => m.status === "Pending"
  ).length;
  const reviewMemberItems: ProposalReviewMemberItem[] = reviewMembers.map(
    (member) => ({
      id: member.id,
      initials: getInitials(member.name),
      name: member.name,
      subtitle: member.subtitle ?? "",
      statusLabel: member.status,
      statusTone:
        member.status === "Approve"
          ? "positive"
          : member.status === "Reject"
            ? "danger"
            : "neutral",
      showCheckIcon: member.status === "Approve",
    })
  );

  const progressPercent = governanceStatus
    ? Math.round(clamp01(governanceStatus.progressFraction) * 100)
    : 0;
  const statusTime = governanceStatus?.timeRemaining ?? "—";
  const closesAt = governanceStatus?.screeningDeadline ?? "";

  const timelineRows: ProposalTimelineRow[] = buildScreeningTimeline(
    proposalAuthor,
    governanceStatus,
    proposalData?.createdAt
  );

  const toRelativeDate = (date: string) => {
    const match = date.match(/\(([^)]+)\)/);
    return match?.[1] ?? date;
  };

  const submitComment = async () => {
    const trimmed = newComment.trim();
    if (!trimmed || !signedAccountId) return;

    const optimisticItem: DiscussionItem = {
      id: `local-${Date.now()}`,
      initials: getInitials(signedAccountId),
      name: signedAccountId,
      subtitle: "",
      date: "Just now",
      body: trimmed,
    };

    setDiscussionItems((prev) => [optimisticItem, ...prev]);
    setNewComment("");
    setShowComposer(false);

    try {
      await submitReview({ action: "COMMENT", rationale: trimmed });
    } catch {
      setDiscussionItems((prev) =>
        prev.filter((item) => item.id !== optimisticItem.id)
      );
    }
  };

  const handleApprove = async () => {
    if (!signedAccountId) return;
    try {
      await submitReview({ action: "APPROVE" });
    } catch {
      // mutation error is surfaced via submitError
    }
  };

  const discussionCount = discussionItems.length;

  if (isLoading) {
    return (
      <section className="mt-8 mb-16">
        <div className="mx-auto max-w-desktop flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8 mb-16">
      <div className="mx-auto max-w-desktop space-y-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1 lg:max-w-[864px]">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-secondary">
              <span className="rounded-[4px] border border-[#f7d774] bg-[#fff6d8] px-[7px] py-[2px] text-[10px] font-semibold uppercase leading-[15px] text-[#171717]">
                {screeningExpansionUiText.topTagForumProposal}
              </span>
              <ProposalTypeBadge
                type={ProposalType.SimpleMajority}
                className="border-[#bee3f8] bg-[rgba(190,227,248,0.35)] px-[7px] py-[3px] font-semibold leading-[15px] text-[#2b6cb0]"
              />
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#404040]">
                Proposal by {proposalAuthor}
                <Image
                  src={icons.northEast}
                  alt="Open source"
                  className="h-3 w-3"
                />
              </span>
            </div>

            <h1 className="mt-1 text-[24px] font-black leading-[36px] text-primary">
              {screeningExpansionUiText.headingPrefix} {title}
            </h1>

            <div className="mt-3 border-b border-line">
              <div className="flex items-center gap-1 text-[14px]">
                <button
                  type="button"
                  onClick={() => setActiveView("proposal")}
                  className={`h-[42px] border-b-2 px-3 text-[14px] leading-[20px] ${
                    activeView === "proposal"
                      ? "border-primary font-semibold text-primary"
                      : "border-transparent font-medium text-tertiary"
                  }`}
                >
                  {screeningExpansionUiText.tabProposal}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView("timeline")}
                  className={`h-[42px] border-b-2 px-3 text-[14px] leading-[20px] ${
                    activeView === "timeline"
                      ? "border-primary font-semibold text-primary"
                      : "border-transparent font-medium text-tertiary"
                  }`}
                >
                  {screeningExpansionUiText.tabTimeline}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView("discussion")}
                  className={`inline-flex h-[42px] items-center gap-2 border-b-2 px-3 text-[14px] leading-[20px] ${
                    activeView === "discussion"
                      ? "border-primary font-semibold text-primary"
                      : "border-transparent font-medium text-tertiary"
                  }`}
                >
                  {screeningExpansionUiText.tabDiscussion}
                  <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-line px-1.5 text-xs font-bold text-[#404040]">
                    {discussionCount}
                  </span>
                </button>
                {isMemberView && activeView === "discussion" && (
                  <button
                    type="button"
                    onClick={() => setShowComposer(true)}
                    className="ml-auto hidden h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-[14px] font-semibold text-neutral hover:opacity-90 sm:inline-flex"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Add a comment</span>
                  </button>
                )}
              </div>
            </div>
            {isMemberView && activeView === "discussion" && (
              <div className="mt-3 sm:hidden">
                <button
                  type="button"
                  onClick={() => setShowComposer(true)}
                  className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary px-3.5 text-[14px] font-semibold text-neutral hover:opacity-90"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Add a comment</span>
                </button>
              </div>
            )}

            {activeView === "proposal" && (
              <div className="space-y-5 pt-3">
                <ProposalVisualizationCard
                  proposalIdForVisualization={proposalId}
                />

                {fullDescription && (
                  <div className="text-base leading-6 text-[#404040]">
                    <Markdown content={fullDescription} />
                  </div>
                )}
              </div>
            )}

            {activeView === "timeline" && (
              <ProposalTimelineView rows={timelineRows} />
            )}

            {activeView === "discussion" && (
              <div
                ref={commentsRef}
                className="max-h-[620px] space-y-0 overflow-x-hidden overflow-y-auto pt-4 pr-2 sm:pr-3 [scrollbar-gutter:stable]"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-[0.66px] text-tertiary">
                    {screeningExpansionUiText.sectionScreeningCommittee}
                  </span>
                  <span className="h-px flex-1 bg-line" />
                  <span className="text-xs text-tertiary">
                    {screeningExpansionUiText.reviewWindowLabel}
                  </span>
                </div>

                {discussionItems.length === 0 ? (
                  <div className="rounded-xl border border-line bg-[#f9f8f7] px-4 py-6 text-center">
                    <p className="text-sm font-medium text-secondary">
                      No reviews yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {discussionItems.map((comment) => (
                      <article key={comment.id} className="min-w-0">
                        <div className="min-w-0 flex items-start gap-3">
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#171717] text-xs font-bold text-white">
                            {comment.initials}
                          </span>
                          <div className="min-w-0 flex-1 space-y-1.5">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold leading-5 text-[#171717]">
                                  {comment.name}
                                </p>
                                <p className="text-xs text-tertiary">
                                  {comment.subtitle}
                                </p>
                              </div>
                              <p className="text-xs leading-4 text-tertiary">
                                {isMemberView
                                  ? comment.date
                                  : toRelativeDate(comment.date)}
                              </p>
                            </div>
                            <div className="rounded-xl border border-line bg-[#fafafa] px-[15px] py-[13px] text-sm leading-[22.75px] text-[#404040]">
                              {comment.body}
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-4">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-[0.66px] text-tertiary">
                      {screeningExpansionUiText.sectionSecurityCouncil}
                    </span>
                    <span className="h-px flex-1 bg-line" />
                    <span className="text-xs text-tertiary">
                      {screeningExpansionUiText.vetoWindowLabel}
                    </span>
                  </div>
                  <div className="rounded-xl border border-line bg-[#f9f8f7] px-4 py-6 text-center">
                    <p className="text-sm font-medium text-secondary">
                      {screeningExpansionUiText.noSecurityCouncilActivityTitle}
                    </p>
                    <p className="mt-1 text-xs text-tertiary">
                      {screeningExpansionUiText.noSecurityCouncilActivityBody}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="w-full max-w-sm space-y-4 lg:w-96">
            <div className="rounded-2xl border border-line bg-neutral shadow-newDefault">
              <div className="border-b border-line px-5 py-4">
                <h2 className="text-[16px] font-semibold leading-[24px] text-primary">
                  {screeningExpansionUiText.reviewCardTitle}
                </h2>
                <p className="text-xs text-tertiary">
                  {screeningExpansionUiText.reviewCardSubtitle}
                </p>
                <ProposalReviewStatusCard
                  containerClassName="mt-4 rounded-lg border border-line bg-wash p-3"
                  preContent={
                    <>
                      <p className="text-[14px] font-semibold leading-[20px] text-emerald-700">
                        {screeningExpansionUiText.approveLabel} -{" "}
                        {approvedCount}
                      </p>
                      <div className="mt-2 flex gap-1">
                        {reviewMembers.map((m) => (
                          <div
                            key={m.id}
                            className={`h-2 flex-1 rounded-full ${
                              m.status === "Approve"
                                ? "bg-emerald-400"
                                : "bg-line"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-tertiary">
                        {reviewMembers.length} members · {pendingCount} pending
                      </p>
                    </>
                  }
                  statusRowContainerClassName="mt-3 border-t border-line pt-3"
                  badgeLabel={screeningExpansionUiText.activeLabel}
                  badgeClassName="rounded bg-blue-100 px-2 py-0.5 font-semibold text-blue-700"
                  timeText={statusTime}
                  timeTextClassName="text-base font-bold text-primary"
                  progressTrackClassName="h-1.5 w-full rounded-full bg-[#bee3f8]"
                  progressFillClassName="h-full rounded-full bg-[#2b6cb0]"
                  progressPercent={progressPercent}
                  dateText={closesAt ? `Closes ${closesAt}` : ""}
                  dateTextClassName="text-[11px] text-tertiary"
                  timeContainerClassName="flex w-[210px] flex-col items-center gap-1"
                />
              </div>

              <ProposalReviewMembersList items={reviewMemberItems} />

              {isMemberView ? (
                <div className="border-t border-line px-4 py-4">
                  {submitError && (
                    <p className="mb-2 text-xs text-red-600">
                      {submitError.message}
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={isSubmitting || !signedAccountId}
                    onClick={handleApprove}
                    className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-neutral hover:opacity-90 disabled:opacity-50"
                  >
                    {screeningExpansionUiText.memberActionApproveButton}
                  </button>
                </div>
              ) : (
                <div className="border-t border-line px-3 pb-3 pt-3">
                  <div className="flex items-start gap-2">
                    <span className="mt-[2px] inline-flex h-3 w-3 shrink-0 items-center justify-center text-[#737373]">
                      <Info className="h-3 w-3" />
                    </span>
                    <p className="text-xs leading-4 text-tertiary">
                      {screeningExpansionUiText.userFooterInfo}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {isMemberView && showComposer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 sm:px-4">
          <div className="max-h-[calc(100vh-24px)] w-full max-w-[700px] overflow-y-auto rounded-[12px] border border-line bg-neutral shadow-newDefault">
            <div className="flex items-start justify-between px-5 pt-5 sm:px-[31px] sm:pt-[22px]">
              <div>
                <h3 className="text-[29px] font-black leading-none text-primary">
                  {screeningExpansionUiText.addCommentTitle}
                </h3>
                <p className="mt-3 text-[14px] leading-[21px] text-[#565656]">
                  {screeningExpansionUiText.addCommentSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowComposer(false)}
                className="text-tertiary hover:text-primary"
                aria-label={screeningExpansionUiText.closeAriaLabel}
              >
                <X className="h-[18px] w-[18px]" />
              </button>
            </div>

            <div className="px-5 pb-5 pt-4 sm:px-[31px] sm:pb-[20px] sm:pt-[22px]">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={5}
                placeholder={screeningExpansionUiText.addCommentPlaceholder}
                className="h-[120px] w-full resize-none rounded-xl border border-line bg-neutral px-4 py-2 text-[14px] leading-[21px] text-primary outline-none focus:outline-none focus:ring-0 focus:border-primary placeholder:text-[#57606a] sm:h-[141px]"
              />

              <div className="mt-5 flex flex-col-reverse gap-2 sm:mt-6 sm:flex-row sm:justify-end sm:gap-3">
                <button
                  type="button"
                  onClick={() => setShowComposer(false)}
                  className="h-[46px] w-full rounded-xl border border-line px-6 text-[14px] font-bold leading-[21px] text-[#404040] hover:bg-wash sm:h-[50px] sm:min-w-[89px] sm:w-auto"
                >
                  {screeningExpansionUiText.cancelButton}
                </button>
                <button
                  type="button"
                  disabled={
                    !newComment.trim() || isSubmitting || !signedAccountId
                  }
                  onClick={submitComment}
                  className={`h-[46px] w-full rounded-xl px-6 text-[14px] font-bold leading-[21px] sm:h-[50px] sm:min-w-[127px] sm:w-auto ${
                    newComment.trim()
                      ? "bg-[#171717] text-white hover:bg-black"
                      : "bg-[#ececec] text-[#a6a6a6]"
                  }`}
                >
                  {screeningExpansionUiText.postCommentButton}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

function buildScreeningTimeline(
  proposalAuthor: string,
  governanceStatus:
    | {
        proposalId: string;
        screeningStatus: "PENDING" | "APPROVED" | "REJECTED";
        screeningDeadline: string | null;
        councilStatus: string | null;
        vetoDeadline: string | null;
        ratifiedAt: string | null;
        timeRemaining: string | null;
        progressFraction: number;
      }
    | null
    | undefined,
  createdAt: string | undefined
): ProposalTimelineRow[] {
  const screeningStatus = governanceStatus?.screeningStatus ?? "PENDING";
  const screeningDone =
    screeningStatus === "APPROVED" || screeningStatus === "REJECTED";

  return [
    {
      id: "forum",
      title: "Forum Submission",
      detail: `by ${proposalAuthor}`,
      forumLinkLabel: "Forum post",
      rightLabel: createdAt ?? "",
      stage: "completed",
    },
    {
      id: "submitted",
      title: "Submitted to House of Stake",
      detail: `by ${proposalAuthor}`,
      rightLabel: createdAt ?? "",
      stage: "completed",
    },
    {
      id: "screening",
      title: "Screening Committee Review",
      badgeLabel: screeningDone
        ? screeningStatus === "APPROVED"
          ? "Approved"
          : "Rejected"
        : "ACTIVE",
      badgeTone: screeningDone
        ? screeningStatus === "APPROVED"
          ? "success"
          : "danger"
        : "info",
      detail: screeningDone
        ? undefined
        : `Closes ${governanceStatus?.screeningDeadline ?? "—"} · ${governanceStatus?.timeRemaining ?? "—"} remaining`,
      rightLabel: governanceStatus?.screeningDeadline ?? "",
      stage: screeningDone ? "completed" : "active",
    },
    {
      id: "community",
      title: "Community Vote",
      badgeLabel: "PENDING",
      badgeTone: "neutral",
      rightLabel: "14 days · begins after screening",
      stage: screeningDone ? "active" : "pending",
    },
    {
      id: "veto",
      title: "Security Council Veto Window",
      badgeLabel: "PENDING",
      badgeTone: "neutral",
      detail: "1 veto required to block",
      rightLabel: governanceStatus?.vetoDeadline
        ? `7 days · begins ${governanceStatus.vetoDeadline}`
        : "7 days",
      stage: "pending",
    },
  ];
}
