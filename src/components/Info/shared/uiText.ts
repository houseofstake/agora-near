export const screeningCommitteePageUiText = {
  title: "Screening Committee",
  description:
    "Reviews submitted proposals for onchain voting eligibility. Committee has 7 days to approve or reject.",
  learnMoreLabel: "Learn more about the Screening Committee",
  learnMoreHref: "https://houseofstake.org/docs/structure/screening-committee",
  statsPendingReviewLabel: "Pending review",
  statsIncomingLabel: "Incoming proposals",
  statsApprovedAllTimeLabel: "Approved\nall time",
  notificationAwaitingPrefix: "You have",
  notificationAwaitingSuffix: "awaiting your approval",
  tabCurrent: "Current",
  tabIncoming: "Incoming",
  tabPast: "Past",
  tableProposal: "Proposal",
  tableTimeRemaining: "Time remaining",
  tableMyVote: "My vote",
  tableComments: "Comments",
  tableType: "Type",
  tableLink: "Link",
  tableDecision: "Decision",
  tableDecided: "Decided",
  showingActiveReviewPrefix: "Showing",
  showingActiveReviewSuffix: "proposals under active review.",
  incomingInfo:
    "Incoming proposals are in deliberation and have not yet been submitted for screening.",
  pastInfoPrefix: "Showing all",
  pastInfoSuffix: "reviewed proposals.",
  forumTag: "Forum",
  forumViewLabel: "View on Forum",
  membersSidebarTitle: "Committee Members",
  membersSidebarFooter:
    "Members have 7 days to review each submitted proposal. Approval advances it to delegate voting.",
};

export const securityCouncilPageUiText = {
  title: "Security Council",
  description:
    "Reviews proposals that passed the delegate vote. Council has 7 days to issue a veto. No action means the proposal is ratified.",
  learnMoreLabel: "Learn more about the Security Council",
  learnMoreHref: "https://houseofstake.org/docs/structure/security-council",
  statsActiveWindowsLabel: "Active windows",
  statsRatifiedAllTimeLabel: "Ratified\nall time",
  statsVetoedLabel: "Vetoed",
  notificationActivePrefix: "You have",
  notificationActiveSuffix: "in the active veto window",
  tabActive: "Active",
  tabPassed: "Passed",
  tabVetoed: "Vetoed",
  tableProposal: "Proposal",
  tableVetoWindowCloses: "Veto window closes",
  tableAction: "Action",
  tableOutcome: "Outcome",
  tableRatifiedOn: "Ratified on",
  tableVetoedOn: "Vetoed on",
  tableRationale: "Rationale",
  statusNoVetoIssued: "No Veto Issued",
  statusVetoed: "Vetoed",
  ratifiedLabel: "Ratified",
  vetoedSummarySuffix: "vetoed. All vetoes require a public explanation post.",
  ratifiedSummarySuffix: "proposals ratified without veto.",
  activeInfo:
    "If no veto is issued before the window closes, the proposal is automatically ratified.",
  membersSidebarTitle: "Council Members",
  membersSidebarFooter:
    "Vetoes must be accompanied by a public post explaining the reasoning. No action within 7 days results in automatic ratification.",
};

export const screeningExpansionUiText = {
  topTagForumProposal: "Forum Proposal",
  headingPrefix: "Sensing Proposal (7-Day Sensing Period) -",
  tabProposal: "Proposal",
  tabTimeline: "Timeline",
  tabDiscussion: "Discussion",
  sectionScreeningCommittee: "Screening Committee",
  sectionSecurityCouncil: "Security Council",
  reviewWindowLabel: "7-day review window",
  vetoWindowLabel: "7-day veto window",
  noSecurityCouncilActivityTitle: "No Security Council activity yet.",
  noSecurityCouncilActivityBody:
    "Comments and veto decisions will appear here if this proposal advances.",
  reviewCardTitle: "Screening Committee Review",
  reviewCardSubtitle: "Committee must reach a decision within 7 days",
  approveLabel: "Approve",
  activeLabel: "ACTIVE",
  memberActionApproveButton: "Approve proposal",
  userFooterInfo:
    "Pending committee decision. If approved, this proposal advances to a delegate vote.",
  addCommentTitle: "Add a comment",
  addCommentSubtitle: "Visible to all committee members and the public",
  addCommentPlaceholder: "Share your review or vote rationale...",
  cancelButton: "Cancel",
  postCommentButton: "Post comment",
  closeAriaLabel: "Close",
};

export const securityExpansionUiText = {
  topTagForumProposal: "Forum Proposal",
  headingPrefix: "Sensing Proposal (7-Day Sensing Period) -",
  tabProposal: "Proposal",
  tabTimeline: "Timeline",
  tabDiscussion: "Discussion",
  discussionVetoChip: "Veto",
  sectionSecurityCouncil: "Security Council",
  sectionScreeningCommittee: "Screening Committee",
  emptyRationale: "No public rationale has been posted yet for this proposal.",
  reviewCardTitle: "Security Council Review",
  reviewCardSubtitle: "Council may veto within 7 days after a vote passes.",
  statusLabel: "Status",
  statusUnderReview: "UNDER REVIEW",
  statusVetoed: "VETOED",
  statusActive: "ACTIVE",
  memberActionIssueVeto: "Issue Veto",
  memberActionVetoIssued: "Veto Issued",
  memberInfoText:
    "No action required to allow this proposal to pass. To block it, issue a veto. A public post with rationale is required.",
  userInfoText:
    "The Security Council has 7 days to veto. If no veto is issued the proposal is ratified.",
  issueVetoTitle: "Issue Veto",
  issueVetoSubtitleBold: "No action required to allow this proposal to pass.",
  issueVetoSubtitleRest: "A public rationale is required if you veto.",
  issueVetoPlaceholder: "Rationale for veto (required)...",
  issueVetoHint: "This rationale will be posted publicly and recorded on-chain.",
  cancelButton: "Cancel",
  postCommentButton: "Post comment",
};

export const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export type V0ProposalMeta = {
  proposalType: string;
  approvalThreshold: string;
};

type StrippedDescription = {
  description: string;
  v0Meta: V0ProposalMeta | null;
};

/**
 * Strips a leading JSON metadata blob (V0 format) from a proposal description.
 * Some older proposals have `{"proposalType":"standard","approvalThreshold":"0.5"}`
 * prepended directly to the markdown content. `decodeMetadata` only handles V1.
 * Returns both the clean description and the parsed metadata (if found).
 */
export const stripLeadingJsonMetadata = (raw: string): StrippedDescription => {
  const trimmed = raw.trimStart();
  if (!trimmed.startsWith("{")) return { description: raw, v0Meta: null };

  let braceDepth = 0;
  let endIndex = -1;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === "{") braceDepth++;
    else if (trimmed[i] === "}") {
      braceDepth--;
      if (braceDepth === 0) {
        endIndex = i;
        break;
      }
    }
  }

  if (endIndex === -1) return { description: raw, v0Meta: null };

  const jsonCandidate = trimmed.slice(0, endIndex + 1);
  try {
    const parsed = JSON.parse(jsonCandidate);
    if (parsed && typeof parsed === "object" && "proposalType" in parsed) {
      return {
        description: trimmed.slice(endIndex + 1).trimStart(),
        v0Meta: {
          proposalType: String(parsed.proposalType ?? ""),
          approvalThreshold: String(parsed.approvalThreshold ?? ""),
        },
      };
    }
  } catch {
    // Not valid JSON — return original
  }

  return { description: raw, v0Meta: null };
};

const PROPOSAL_TYPE_DISPLAY: Record<string, { label: string; blurb: string }> = {
  standard: {
    label: "Standard Proposal",
    blurb:
      "This is a binding proposal. If approved by the required majority, its outcome will be enacted on-chain.",
  },
  sensing: {
    label: "Sensing Proposal",
    blurb:
      "This is a sensing proposal and serves to gauge community sentiment and facilitate open discussion ahead of a binding decision proposal.",
  },
};

const SENSING_NOTICE =
  "It is non-binding and carries no direct outcomes. Its purpose is to gather input, build visibility, and allow stakeholders to prepare for the formal vote.";

/**
 * Builds a markdown snippet for the Proposal Type section.
 * Returns empty string when there is nothing to show.
 */
export const buildProposalTypeMarkdown = (
  v0Meta: V0ProposalMeta | null,
  v1ProposalType?: string
): string => {
  const typeKey =
    v0Meta?.proposalType?.toLowerCase() ??
    v1ProposalType?.toLowerCase() ??
    "";

  const display = PROPOSAL_TYPE_DISPLAY[typeKey];
  if (!display) return "";

  const lines = [
    "---",
    "## Proposal Type",
    "",
    `**${display.label}:** ${display.blurb}`,
  ];

  if (typeKey === "sensing") {
    lines.push("", SENSING_NOTICE);
  }

  return lines.join("\n");
};
