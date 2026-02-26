import axios from "axios";
import { Endpoint } from "../constants";
import {
  Proposal,
  ProposalVotingHistoryRecord,
  ProposalNonVotersRecord,
  DraftProposal,
  CreateDraftProposalRequest,
  UpdateDraftProposalRequest,
  GetDraftProposalsResponse,
  UpdateDraftProposalStageRequest,
  GetProposalQuorumResponse,
} from "./types";
import { getRpcUrl } from "@/lib/utils";
import { JsonRpcProvider } from "@near-js/providers";
import { CONTRACTS } from "@/lib/contractConstants";
import { ProposalInfo } from "@/lib/contracts/types/voting";

export const fetchApprovedProposals = async (
  pageSize: number,
  currentPage: number
) => {
  const response = await axios.get<{
    proposals: Proposal[];
    count: number;
  }>(
    `${Endpoint.Proposals}/approved?page_size=${pageSize}&page=${currentPage}`
  );

  return response.data;
};

export const fetchPendingProposals = async (
  pageSize: number,
  currentPage: number,
  createdBy?: string
) => {
  const response = await axios.get<{
    proposals: Proposal[];
    count: number;
  }>(
    `${Endpoint.Proposals}/pending?page_size=${pageSize}&page=${currentPage}${createdBy ? `&created_by=${createdBy}` : ""}`
  );

  return response.data;
};

export const fetchProposalVotes = async (
  proposalId: string,
  pageSize: number,
  currentPage: number
) => {
  const response = await axios.get<{
    votes: ProposalVotingHistoryRecord[];
    count: number;
  }>(
    `${Endpoint.Proposals}/${proposalId}/votes?page_size=${pageSize}&page=${currentPage}`
  );

  return response.data;
};

export const fetchProposalNonVoters = async (
  proposalId: string,
  pageSize: number,
  currentPage: number
) => {
  const response = await axios.get<{
    nonVoters: ProposalNonVotersRecord[];
    count: number;
  }>(
    `${Endpoint.Proposals}/${proposalId}/non-voters?page_size=${pageSize}&page=${currentPage}`
  );

  return response.data;
};
export const fetchProposalChartData = async (proposalId: string) => {
  const response = await axios.get<{
    data: ProposalVotingHistoryRecord[];
  }>(`${Endpoint.Proposals}/${proposalId}/charts`);

  return response.data;
};

export const fetchProposal = async (proposalId: string) => {
  const rpcUrl = getRpcUrl("mainnet", {
    useArchivalNode: true,
  });

  const jsonRpcProvider = new JsonRpcProvider({ url: rpcUrl });

  const res = await jsonRpcProvider.query({
    request_type: "call_function",
    finality: "optimistic",
    account_id: CONTRACTS.VOTING_CONTRACT_ID,
    method_name: "get_proposal",
    args_base64: Buffer.from(
      JSON.stringify({ proposal_id: Number(proposalId) })
    ).toString("base64"),
  });

  const resultArray = (res as any)?.result;
  const proposal = resultArray
    ? JSON.parse(Buffer.from(resultArray).toString())
    : null;

  return proposal as ProposalInfo | null;
};

export const createDraftProposal = async (data: CreateDraftProposalRequest) => {
  const response = await axios.post<DraftProposal>(
    Endpoint.DraftProposals,
    data
  );
  return response.data;
};

export const fetchDraftProposals = async (params?: {
  author?: string;
  stage?: string;
  page?: number;
  pageSize?: number;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.author) searchParams.set("author", params.author);
  if (params?.stage) searchParams.set("stage", params.stage);
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.pageSize)
    searchParams.set("page_size", params.pageSize.toString());

  const response = await axios.get<GetDraftProposalsResponse>(
    `${Endpoint.DraftProposals}?${searchParams}`
  );
  return response.data;
};

export const fetchDraftProposal = async (id: string) => {
  const response = await axios.get<DraftProposal>(
    `${Endpoint.DraftProposals}/${id}`
  );
  return response.data;
};

export const updateDraftProposal = async (
  id: string,
  data: {
    data: UpdateDraftProposalRequest;
    signature: string;
    publicKey: string;
    message: string;
  },
  networkId: string
) => {
  const response = await axios.put<DraftProposal>(
    `${Endpoint.DraftProposals}/${id}?network_id=${networkId}`,
    data
  );
  return response.data;
};

export const updateDraftProposalStage = async (
  id: string,
  data: UpdateDraftProposalStageRequest,
  networkId: string
) => {
  const response = await axios.put<DraftProposal>(
    `${Endpoint.DraftProposals}/${id}/stage?network_id=${networkId}`,
    data
  );
  return response.data;
};

export const deleteDraftProposal = async (data: {
  id: string;
  action: "delete";
  signature: string;
  publicKey: string;
  message: string;
  networkId: string;
}) => {
  await axios.delete(
    `${Endpoint.DraftProposals}/${data.id}?network_id=${data.networkId}`,
    {
      data: {
        action: data.action,
        signature: data.signature,
        publicKey: data.publicKey,
        message: data.message,
      },
    }
  );
};

export const getProposalQuorum = async (data: { proposalId: string }) =>
  axios.get<GetProposalQuorumResponse>(
    `${Endpoint.Proposals}/${data.proposalId}/quorum`
  );

export const fetchVoteChanges = async (proposalId: string) => {
  const { data } = await axios.get(`${Endpoint.VoteChanges}/${proposalId}`);
  return data;
};
