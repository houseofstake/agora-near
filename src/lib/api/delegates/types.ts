export type NotificationPreference = "true" | "false" | "prompt";

export interface NotificationPreferences {
  wants_proposal_created_email: NotificationPreference;
  wants_proposal_ending_soon_email: NotificationPreference;
  last_updated: string;
}

export interface NotificationPreferencesInput {
  wants_proposal_created_email?: NotificationPreference;
  wants_proposal_ending_soon_email?: NotificationPreference;
}

export const defaultNotificationPreferences = (): NotificationPreferences => ({
  wants_proposal_created_email: "prompt",
  wants_proposal_ending_soon_email: "prompt",
  last_updated: new Date().toISOString(),
});

export const isValidNotificationPreference = (
  value: any
): value is NotificationPreference => {
  return value === "true" || value === "false" || value === "prompt";
};

export type DelegateStatement = {
  address: string;
  signature: string;
  payload: {
    delegateStatement: string;
    topIssues: {
      value: string;
      type: string;
    }[];
  };
  twitter: string;
  discord: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  warpcast: string;
  endorsed: boolean;
};

export type CreateDelegateStatementInput = {
  data: {
    address: string;
    twitter: string;
    discord: string;
    email: string;
    warpcast: string;
    topIssues: {
      type: string;
      value: string;
    }[];
    agreeCodeConduct: boolean;
    statement: string;
    notification_preferences?: NotificationPreferencesInput;
  };
  message: string;
  signature: string;
  publicKey: string;
};

export type CreateDelegateStatementResponse = {
  success: boolean;
};

export type DelegateProfile = {
  address: string;
  twitter?: string | null;
  discord?: string | null;
  email?: string | null;
  warpcast?: string | null;
  topIssues?:
    | {
        type: string;
        value: string;
      }[]
    | null;
  endorsed?: boolean | null;
  statement?: string | null;
  votingPower?: string | null;
  participationRate?: string | null;
  numOfDelegators?: string | null;
  forCount?: number | null;
  againstCount?: number | null;
  abstainCount?: number | null;
  delegatedFromCount?: number | null;
  notificationPreferences?: NotificationPreferences | null;
};

export type GetDelegateResponse = {
  delegate?: DelegateProfile;
};

export type GetDelegatesResponse = {
  count: number;
  delegates: DelegateProfile[];
};

export type DelegateSearchResult = {
  id: string;
  address: string;
  statement: string | null;
  topIssuesText: string;
  endorsed: boolean;
  issueTypes: string[];
  votingPower: number;
  participationRate: number;
  lastVoteTimestamp: number | null;
  lastDelegationTimestamp: number | null;
  herdAlignmentRate: number | null;
};

export type DelegateSearchResponse = {
  delegates: DelegateSearchResult[];
  total: number;
  query: string;
};

export function searchResultToDelegateProfile(
  d: DelegateSearchResult
): DelegateProfile {
  return {
    address: d.address,
    statement: d.statement,
    endorsed: d.endorsed,
    votingPower: String(d.votingPower),
    participationRate: String(d.participationRate),
    topIssues: d.issueTypes.map((type) => ({ type, value: "" })),
  };
}

export type VoteHistory = {
  voteOption: string;
  votingPower: string;
  address: string;
  votedAt: Date;
  proposalId: string;
  proposalName: string | null;
};

export type GetVoteHistoryResponse = {
  count: number;
  votes: VoteHistory[];
};

export type GetDelegationEventsResponse = {
  count: number;
  events: DelegationEvent[];
};

export type DelegationEvent = {
  id: string;
  blockHash: string;
  blockHeight: number;
  delegateMethod: string;
  delegateeId?: string;
  delegatorId: string;
  eventDate: string;
  eventTimestamp: string;
  nearAmount?: string;
  receiptId?: string;
};

export type HosActivity = {
  receiptId?: string | null;
  blockHeight?: string | null;
  eventDate?: string | null;
  nearAmount?: string | null;
  lockedNearBalance?: string | null;
  transactionType?: string | null;
};

export type GetHosActivityResponse = {
  count: number;
  hosActivity: HosActivity[];
};
