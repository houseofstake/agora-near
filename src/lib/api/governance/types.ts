// ── Screening Committee ──────────────────────────────────────────────

export interface ScreeningMember {
  id: string;
  wallet: string;
  name: string;
  subtitle: string | null;
  appointedAt: string;
}

export interface ScreeningStats {
  pendingCount: number;
  incomingCount: number;
  approvedAllTimeCount: number;
}

export interface ScreeningCurrentProposal {
  proposalId: string;
  title: string | null;
  submittedBy: string | null;
  timeRemaining: string | null;
  progressFraction: number;
  commentsCount: number;
  myVote: "APPROVE" | "REJECT" | null;
}

export interface ScreeningIncomingProposal {
  id: string;
  title: string;
  submittedBy: string;
  forumLink: string | null;
  submittedAt: string | null;
}

export interface ScreeningPastProposal {
  proposalId: string;
  title: string | null;
  submittedBy: string | null;
  decidedAt: string | null;
  status: "APPROVED" | "REJECTED";
  commentsCount: number;
}

export interface ScreeningProposalDetail {
  proposal: {
    proposalId: string;
    title: string | null;
    description: string | null;
    url: string | null;
    submittedBy: string | null;
    createdAt: string;
    isApproved: boolean;
    isRejected: boolean;
    hasVotes: boolean;
    forVotingPower: string | null;
    againstVotingPower: string | null;
    abstainVotingPower: string | null;
    numDistinctVoters: string | null;
  };
  governanceStatus: {
    proposalId: string;
    screeningStatus: "PENDING" | "APPROVED" | "REJECTED";
    screeningDeadline: string | null;
    councilStatus: string | null;
    vetoDeadline: string | null;
    ratifiedAt: string | null;
    timeRemaining: string | null;
    progressFraction: number;
  } | null;
  reviews: Array<{
    id: string;
    action: "APPROVE" | "REJECT" | "COMMENT";
    rationale: string | null;
    createdAt: string;
    member: {
      id: string;
      wallet: string;
      name: string;
      subtitle: string | null;
    };
  }>;
  members: ScreeningMember[];
}

// ── Security Council ─────────────────────────────────────────────────

export interface CouncilMember {
  id: string;
  wallet: string;
  name: string;
  subtitle: string | null;
  appointedAt: string;
}

export interface CouncilStats {
  activeCount: number;
  ratifiedAllTimeCount: number;
  vetoedCount: number;
}

export interface CouncilActiveProposal {
  proposalId: string;
  title: string | null;
  submittedBy: string | null;
  votesSummary: string;
  timeRemaining: string | null;
  progressFraction: number;
  closesAt: string | null;
  actionStatus: string;
}

export interface CouncilPassedProposal {
  proposalId: string;
  title: string | null;
  submittedBy: string | null;
  votesSummary: string;
  ratifiedOn: string | null;
}

export interface CouncilVetoedProposal {
  proposalId: string;
  title: string | null;
  submittedBy: string | null;
  votesSummary: string;
  vetoedOn: string | null;
  rationaleAuthor: { name: string; wallet: string } | null;
}

export interface CouncilProposalDetail {
  proposal: {
    proposalId: string;
    title: string | null;
    description: string | null;
    url: string | null;
    submittedBy: string | null;
    createdAt: string;
    isApproved: boolean;
    isRejected: boolean;
    hasVotes: boolean;
    forVotingPower: string | null;
    againstVotingPower: string | null;
    abstainVotingPower: string | null;
    numDistinctVoters: string | null;
    votesSummary: string;
  };
  governanceStatus: {
    proposalId: string;
    screeningStatus: string;
    screeningDeadline: string | null;
    councilStatus: "ACTIVE" | "RATIFIED" | "VETOED";
    vetoDeadline: string | null;
    ratifiedAt: string | null;
    timeRemaining: string | null;
    progressFraction: number;
  } | null;
  reviews: Array<{
    id: string;
    action: string;
    rationale: string | null;
    createdAt: string;
    member: {
      id: string;
      wallet: string;
      name: string;
      subtitle: string | null;
    };
  }>;
  vetoRationale: {
    rationale: string;
    createdAt: string;
    member: {
      id: string;
      wallet: string;
      name: string;
      subtitle: string | null;
    };
  } | null;
}

// ── Shared ───────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  proposals: T[];
  stats: ScreeningStats | CouncilStats;
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SubmitReviewRequest {
  accountId: string;
  signature: string;
  publicKey: string;
  message: string;
  data: {
    action?: "APPROVE" | "REJECT" | "COMMENT";
    rationale?: string;
  };
}
