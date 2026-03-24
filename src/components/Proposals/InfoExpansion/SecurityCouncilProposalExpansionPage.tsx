"use client";

import Image from "next/image";
import { AlertCircle, Info, X } from "lucide-react";
import { useState } from "react";
import { icons } from "@/assets/icons";
import { ProposalTimelineView, type ProposalTimelineRow } from "@/components/Proposals/InfoExpansion/ProposalTimelineView";
import { ProposalVisualizationCard } from "@/components/Proposals/InfoExpansion/ProposalVisualizationCard";
import { ProposalDiscussionThread, type ProposalDiscussionItem } from "@/components/Proposals/InfoExpansion/ProposalDiscussionThread";
import { ProposalReviewStatusCard } from "@/components/Proposals/InfoExpansion/ProposalReviewStatusCard";
import { ProposalReviewMembersList, type ProposalReviewMemberItem } from "@/components/Proposals/InfoExpansion/ProposalReviewMembersList";
import { ProposalTypeBadge } from "@/components/Proposals/ProposalTypeBadge";
import { ProposalType, decodeMetadata } from "@/lib/proposalMetadata";
import Markdown from "@/components/shared/Markdown/Markdown";
import { useCouncilProposalDetail } from "@/hooks/useCouncilProposalDetail";
import { useCouncilMembers } from "@/hooks/useCouncilMembers";
import { useSubmitCouncilVeto } from "@/hooks/useSubmitCouncilVeto";
import { useNear } from "@/contexts/NearContext";
import {
  securityExpansionUiText,
  getInitials,
  stripLeadingJsonMetadata,
  buildProposalTypeMarkdown,
} from "@/components/Info/shared/uiText";

type SecurityCouncilProposalExpansionPageProps = {
  proposalId: string;
  openComments?: boolean;
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export const SecurityCouncilProposalExpansionPage = ({
  proposalId,
  openComments = false,
}: SecurityCouncilProposalExpansionPageProps) => {
  const { signedAccountId } = useNear();
  const {
    proposal: proposalData,
    governanceStatus,
    reviews,
    vetoRationale,
    isLoading,
  } = useCouncilProposalDetail(proposalId);
  const { members: councilMembers } = useCouncilMembers();
  const { submitVeto, isSubmitting, error: submitError } = useSubmitCouncilVeto(proposalId);

  const isMember = councilMembers?.some((m) => m.wallet === signedAccountId) ?? false;
  const isMemberView = isMember;
  const [activeView, setActiveView] = useState<"proposal" | "timeline" | "discussion">(
    openComments ? "discussion" : "proposal"
  );
  const [isIssueVetoOpen, setIsIssueVetoOpen] = useState(false);
  const [vetoRationaleDraft, setVetoRationaleDraft] = useState("");
  const [postedVetoRationale, setPostedVetoRationale] = useState<string | null>(null);
  const [localVetoIssued, setLocalVetoIssued] = useState(false);

  const isVetoed =
    governanceStatus?.councilStatus === "VETOED" ||
    Boolean(vetoRationale) ||
    (isMemberView && localVetoIssued);

  const title = proposalData
    ? `${proposalData.proposalId}: ${proposalData.title ?? "Untitled"}`
    : `${proposalId}: Security Council proposal`;
  const proposalAuthor = proposalData?.submittedBy ?? "unknown.near";
  const { description: rawDescription, metadata } = decodeMetadata(proposalData?.description ?? "");
  const { description: cleanDescription, v0Meta } = stripLeadingJsonMetadata(rawDescription);
  const proposalTypeMd = buildProposalTypeMarkdown(v0Meta, metadata.proposalType);
  const fullDescription = proposalTypeMd
    ? `${cleanDescription}\n\n${proposalTypeMd}`
    : cleanDescription;

  const discussionBody = postedVetoRationale
    ? postedVetoRationale.split("\n").filter((line) => line.trim().length > 0)
    : vetoRationale
      ? [vetoRationale.rationale]
      : [securityExpansionUiText.emptyRationale];
  const canPostVeto = vetoRationaleDraft.trim().length > 0;
  const hasSecurityCouncilRationale = isMemberView
    ? Boolean(isVetoed || postedVetoRationale || vetoRationale)
    : Boolean(isVetoed);

  const vetoAuthor = vetoRationale?.member;
  const vetoAuthorInitials = vetoAuthor ? getInitials(vetoAuthor.name) : "??";

  const securityCouncilDiscussionItems: ProposalDiscussionItem[] =
    hasSecurityCouncilRationale
      ? [
          {
            id: "security-veto",
            initials: vetoAuthorInitials,
            name: vetoAuthor?.name ?? "Council Member",
            subtitle: vetoAuthor?.subtitle ?? "",
            date: vetoRationale?.createdAt ?? "Just now",
            body: discussionBody.join(" "),
            isVeto: true,
          },
        ]
      : [];

  const screeningCommitteeDiscussionItems: ProposalDiscussionItem[] = (
    reviews ?? []
  ).map((review) => ({
    id: review.id,
    initials: getInitials(review.member.name),
    name: review.member.name,
    subtitle: review.member.subtitle ?? "",
    date: review.createdAt,
    body: review.rationale ?? "",
  }));

  const discussionCount =
    securityCouncilDiscussionItems.length + screeningCommitteeDiscussionItems.length;

  const allMembers = councilMembers ?? [];
  const vetoMemberId = vetoRationale?.member?.id;
  const reviewMembers = allMembers.map((member) => ({
    ...member,
    status: (isVetoed && member.id === vetoMemberId) || (localVetoIssued && member.wallet === signedAccountId)
      ? "Veto"
      : "Pending",
  }));

  const reviewMemberItems: ProposalReviewMemberItem[] = reviewMembers.map((member) => ({
    id: member.id,
    initials: getInitials(member.name),
    name: member.wallet === signedAccountId ? `${member.name} (you)` : member.name,
    subtitle: member.subtitle ?? "",
    statusLabel: member.status,
    statusTone:
      !isMemberView && isVetoed && member.status !== "Veto"
        ? "none"
        : member.status === "Veto"
          ? "danger"
          : "neutral",
  }));

  const progressPercent = governanceStatus
    ? Math.round(clamp01(governanceStatus.progressFraction) * 100)
    : isVetoed
      ? 100
      : 40;
  const statusTime = governanceStatus?.timeRemaining ?? (isVetoed ? "0d 0h 0m" : "—");

  const timelineRows: ProposalTimelineRow[] = buildSecurityTimeline(
    isVetoed,
    governanceStatus,
    proposalData?.createdAt
  );

  const handleVetoSubmit = async () => {
    if (!canPostVeto || !signedAccountId) return;

    const rationaleText = vetoRationaleDraft.trim();
    setPostedVetoRationale(rationaleText);
    setLocalVetoIssued(true);
    setIsIssueVetoOpen(false);
    setVetoRationaleDraft("");
    setActiveView("discussion");

    try {
      await submitVeto({ action: "REJECT", rationale: rationaleText });
    } catch {
      setPostedVetoRationale(null);
      setLocalVetoIssued(false);
    }
  };

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
                {securityExpansionUiText.topTagForumProposal}
              </span>
              <ProposalTypeBadge
                type={ProposalType.SimpleMajority}
                className="border-[#bee3f8] bg-[rgba(190,227,248,0.35)] px-[7px] py-[3px] font-semibold leading-[15px] text-[#2b6cb0]"
              />
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#404040]">
                Proposal by {proposalAuthor}
                <Image src={icons.northEast} alt="Open source" className="h-3 w-3" />
              </span>
            </div>

            <h1 className="mt-1 text-[24px] font-black leading-[36px] text-primary">
              {securityExpansionUiText.headingPrefix} {title}
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
                  {securityExpansionUiText.tabProposal}
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
                  {securityExpansionUiText.tabTimeline}
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
                  {securityExpansionUiText.tabDiscussion}
                  {isVetoed ? (
                    <span className="inline-flex h-5 items-center rounded-full bg-[#fee2e2] px-2 text-[10px] font-semibold leading-4 text-[#c52f00]">
                      {securityExpansionUiText.discussionVetoChip}
                    </span>
                  ) : (
                    <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-line px-1.5 text-xs font-bold text-[#404040]">
                      {discussionCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {activeView === "proposal" && (
              <div className="space-y-5 pt-3">
                <ProposalVisualizationCard proposalIdForVisualization={proposalId} />

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
              <div className="space-y-4 pt-4">
                <ProposalDiscussionThread
                  title={securityExpansionUiText.sectionSecurityCouncil}
                  items={securityCouncilDiscussionItems}
                  emptyStateText={securityExpansionUiText.emptyRationale}
                />

                <div className="pt-2">
                  <ProposalDiscussionThread
                    title={securityExpansionUiText.sectionScreeningCommittee}
                    items={screeningCommitteeDiscussionItems}
                  />
                </div>
              </div>
            )}
          </div>

          <aside className="w-full max-w-sm space-y-4 lg:w-96">
            <div className="rounded-2xl border border-line bg-neutral shadow-newDefault">
              <div className="border-b border-line px-5 py-4">
                <h2 className="text-[16px] font-semibold leading-[24px] text-primary">
                  {securityExpansionUiText.reviewCardTitle}
                </h2>
                <p className="text-xs text-tertiary">
                  {securityExpansionUiText.reviewCardSubtitle}
                </p>

                <ProposalReviewStatusCard
                  containerClassName="mt-4 rounded-[6px] border border-line bg-wash p-px shadow-[0px_4px_12px_0px_rgba(0,0,0,0.02),0px_2px_2px_0px_rgba(0,0,0,0.03)]"
                  headerClassName="px-4 pb-2 pt-4"
                  statusLabel={securityExpansionUiText.statusLabel}
                  statusValue={
                    isVetoed
                      ? securityExpansionUiText.statusVetoed
                      : securityExpansionUiText.statusUnderReview
                  }
                  statusValueClassName={`mt-2 text-2xl font-semibold leading-5 ${
                    isVetoed ? "text-[#d62600]" : "text-[#2b6cb0]"
                  }`}
                  statusRowContainerClassName="border-t border-line bg-[#fafafa] px-4 pb-2 pt-[9px]"
                  badgeLabel={
                    isVetoed
                      ? securityExpansionUiText.statusVetoed
                      : securityExpansionUiText.statusActive
                  }
                  badgeClassName={`rounded-[4px] px-1 py-0.5 text-xs font-semibold ${
                    isVetoed ? "bg-[#fee2e2] text-[#c52f00]" : "bg-blue-100 text-blue-700"
                  }`}
                  timeText={statusTime}
                  progressTrackClassName={`h-1.5 w-full rounded-full ${
                    isVetoed ? "bg-[#fee2e2]" : "bg-[#bee3f8]"
                  }`}
                  progressFillClassName={`h-full rounded-full ${
                    isVetoed ? "bg-[#e23636]" : "bg-[#2b6cb0]"
                  }`}
                  progressPercent={progressPercent}
                  dateText={
                    isVetoed
                      ? `Vetoed ${vetoRationale?.createdAt ?? ""}`
                      : `Closes ${governanceStatus?.vetoDeadline ?? ""}`
                  }
                />
              </div>

              <ProposalReviewMembersList
                items={reviewMemberItems}
                rowClassName="flex min-h-[57px] items-center gap-3 px-5 py-3"
              />

              {isMemberView ? (
                <div className="border-t border-line px-4 py-[13px]">
                  {submitError && (
                    <p className="mb-2 text-xs text-red-600">{submitError.message}</p>
                  )}
                  <button
                    type="button"
                    disabled={isVetoed || isSubmitting || !signedAccountId}
                    onClick={() => setIsIssueVetoOpen(true)}
                    className={`w-full rounded-xl px-4 py-3 text-sm font-semibold leading-5 ${
                      isVetoed
                        ? "border border-[#d62600] bg-[#ffefed] text-[#d62600] opacity-50"
                        : "border border-[#e23636] bg-neutral text-[#e23636] hover:bg-red-50"
                    }`}
                  >
                    {isVetoed
                      ? securityExpansionUiText.memberActionVetoIssued
                      : securityExpansionUiText.memberActionIssueVeto}
                  </button>
                </div>
              ) : (
                <div className="border-t border-line px-3 pb-3 pt-3">
                  <div className="flex items-start gap-2">
                    <span className="mt-[2px] inline-flex h-3 w-3 shrink-0 items-center justify-center text-[#737373]">
                      <Info className="h-3 w-3" />
                    </span>
                    <p className="text-xs leading-4 text-tertiary">
                      {securityExpansionUiText.userInfoText}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {isMemberView && isIssueVetoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setIsIssueVetoOpen(false)}
        >
          <div
            className="max-h-[calc(100vh-32px)] w-full max-w-[700px] overflow-y-auto rounded-xl border border-line bg-white shadow-newDefault"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between px-5 pt-5 sm:px-8 sm:pt-6">
              <div>
                <h3 className="text-[30px] font-black leading-[1.05] text-black sm:text-[36px]">
                  {securityExpansionUiText.issueVetoTitle}
                </h3>
                <p className="mt-2 text-sm leading-[21px] text-[#565656]">
                  <span className="font-bold">
                    {securityExpansionUiText.issueVetoSubtitleBold}
                  </span>{" "}
                  {securityExpansionUiText.issueVetoSubtitleRest}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsIssueVetoOpen(false)}
                className="ml-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-[#737373] hover:bg-wash"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-5 pb-5 pt-4 sm:px-8 sm:pb-6">
              <div className="overflow-hidden rounded-xl border border-[#d62600]">
                <textarea
                  value={vetoRationaleDraft}
                  onChange={(event) => setVetoRationaleDraft(event.target.value)}
                  rows={5}
                  placeholder={securityExpansionUiText.issueVetoPlaceholder}
                  className="w-full resize-none border-0 px-4 py-2 text-sm leading-[21px] text-[#57606a] outline-none focus:outline-none focus:ring-0"
                />
                <div className="flex items-center gap-1 border-t border-line bg-[#fafafa] px-4 py-2 text-[10px] leading-[21px] text-[#404040]">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{securityExpansionUiText.issueVetoHint}</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsIssueVetoOpen(false)}
                  className="rounded-xl border border-line bg-white px-5 py-3 text-sm font-bold leading-[21px] text-[#404040]"
                >
                  {securityExpansionUiText.cancelButton}
                </button>
                <button
                  type="button"
                  disabled={!canPostVeto || isSubmitting || !signedAccountId}
                  onClick={handleVetoSubmit}
                  className={`rounded-xl px-5 py-3 text-sm font-bold leading-[21px] ${
                    canPostVeto
                      ? "bg-[#171717] text-white hover:bg-black"
                      : "bg-[#ececec] text-[#a6a6a6]"
                  }`}
                >
                  {securityExpansionUiText.postCommentButton}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

function buildSecurityTimeline(
  isVetoed: boolean,
  governanceStatus: {
    proposalId: string;
    screeningStatus: string;
    screeningDeadline: string | null;
    councilStatus: "ACTIVE" | "RATIFIED" | "VETOED";
    vetoDeadline: string | null;
    ratifiedAt: string | null;
    timeRemaining: string | null;
    progressFraction: number;
  } | null | undefined,
  createdAt: string | undefined
): ProposalTimelineRow[] {
  const vetoStage = isVetoed ? "completed" : "active";
  const vetoBadgeTone = isVetoed ? "danger" : "info";

  return [
    {
      id: "forum",
      title: "Forum Submission",
      rightLabel: createdAt ?? "",
      detail: `by ${governanceStatus?.proposalId ?? "unknown.near"}`,
      forumLinkLabel: "Forum post",
      stage: "completed" as const,
    },
    {
      id: "submitted",
      title: "Submitted to House of Stake",
      rightLabel: createdAt ?? "",
      stage: "completed" as const,
    },
    {
      id: "screening",
      title: "Screening Committee Review",
      rightLabel: governanceStatus?.screeningDeadline ?? "",
      badgeLabel: "Approved",
      badgeTone: "success" as const,
      stage: "completed" as const,
    },
    {
      id: "community",
      title: "Community Vote",
      rightLabel: "",
      badgeLabel: "Passed",
      badgeTone: "success" as const,
      stage: "completed" as const,
    },
    {
      id: "vetoWindow",
      title: "Security Council Veto Window",
      rightLabel: governanceStatus?.vetoDeadline
        ? `Closes ${governanceStatus.vetoDeadline}`
        : "",
      badgeLabel: isVetoed ? "VETOED" : "ACTIVE",
      badgeTone: vetoBadgeTone,
      detail: isVetoed
        ? `Vetoed${governanceStatus?.ratifiedAt ? ` ${governanceStatus.ratifiedAt}` : ""}`
        : `${governanceStatus?.timeRemaining ?? "—"} remaining`,
      stage: vetoStage,
    },
  ];
}
