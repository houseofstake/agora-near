import axios from "axios";
import { Endpoint } from "../constants";
import {
  ScreeningMember,
  ScreeningStats,
  ScreeningCurrentProposal,
  ScreeningIncomingProposal,
  ScreeningPastProposal,
  ScreeningProposalDetail,
  CouncilMember,
  CouncilStats,
  CouncilActiveProposal,
  CouncilPassedProposal,
  CouncilVetoedProposal,
  CouncilProposalDetail,
  PaginatedResponse,
  SubmitReviewRequest,
} from "./types";

// ── Screening Committee ──────────────────────────────────────────────

export const fetchScreeningMembers = async () => {
  const { data } = await axios.get<{ members: ScreeningMember[] }>(
    `${Endpoint.ScreeningCommittee}/members`
  );
  return data.members;
};

export const fetchScreeningProposals = async (
  status: "current" | "incoming" | "past",
  page: number,
  pageSize: number,
  search?: string,
  wallet?: string
) => {
  const params = new URLSearchParams({
    status,
    page: String(page),
    page_size: String(pageSize),
  });
  if (search?.trim()) params.set("search", search.trim());
  if (wallet) params.set("wallet", wallet);

  const { data } = await axios.get<
    PaginatedResponse<
      | ScreeningCurrentProposal
      | ScreeningIncomingProposal
      | ScreeningPastProposal
    >
  >(`${Endpoint.ScreeningCommittee}/proposals?${params}`);
  return data;
};

export const fetchScreeningProposalDetail = async (proposalId: string) => {
  const safeId = encodeURIComponent(proposalId);
  const { data } = await axios.get<ScreeningProposalDetail>(
    `${Endpoint.ScreeningCommittee}/proposals/${safeId}`
  );
  return data;
};

export const submitScreeningReview = async (
  proposalId: string,
  body: SubmitReviewRequest
) => {
  if (!body.accountId || !body.signature || !body.publicKey) {
    throw new Error(
      "Missing required authentication fields for review submission"
    );
  }
  const safeId = encodeURIComponent(proposalId);
  const { data } = await axios.post(
    `${Endpoint.ScreeningCommittee}/proposals/${safeId}/review`,
    body
  );
  return data;
};

// ── Security Council ─────────────────────────────────────────────────

export const fetchCouncilMembers = async () => {
  const { data } = await axios.get<{ members: CouncilMember[] }>(
    `${Endpoint.SecurityCouncil}/members`
  );
  return data.members;
};

export const fetchCouncilProposals = async (
  status: "active" | "passed" | "vetoed",
  page: number,
  pageSize: number,
  search?: string,
  wallet?: string
) => {
  const params = new URLSearchParams({
    status,
    page: String(page),
    page_size: String(pageSize),
  });
  if (search?.trim()) params.set("search", search.trim());
  if (wallet) params.set("wallet", wallet);

  const { data } = await axios.get<
    PaginatedResponse<
      CouncilActiveProposal | CouncilPassedProposal | CouncilVetoedProposal
    >
  >(`${Endpoint.SecurityCouncil}/proposals?${params}`);
  return data;
};

export const fetchCouncilProposalDetail = async (proposalId: string) => {
  const safeId = encodeURIComponent(proposalId);
  const { data } = await axios.get<CouncilProposalDetail>(
    `${Endpoint.SecurityCouncil}/proposals/${safeId}`
  );
  return data;
};

export const submitCouncilVeto = async (
  proposalId: string,
  body: SubmitReviewRequest
) => {
  if (!body.accountId || !body.signature || !body.publicKey) {
    throw new Error(
      "Missing required authentication fields for veto submission"
    );
  }
  const safeId = encodeURIComponent(proposalId);
  const { data } = await axios.post(
    `${Endpoint.SecurityCouncil}/proposals/${safeId}/review`,
    body
  );
  return data;
};
