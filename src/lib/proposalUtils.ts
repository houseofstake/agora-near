import {
  convertNanoSecondsToDays,
  formatNanoSecondsToTimeUnit,
} from "@/lib/utils";
import Big from "big.js";
import { format } from "date-fns";
import {
  ProposalDisplayStatus,
  ProposalStatus,
} from "./contracts/types/voting";
import { decodeMetadata, ProposalMetadata } from "./proposalMetadata";
import {
  DEFAULT_QUORUM_FLOOR_VENEAR,
  DEFAULT_QUORUM_THRESHOLD_PERCENTAGE_BPS,
} from "./constants";
import { parseNearAmount } from "@near-js/utils";

export const isApprovalThresholdMet = ({
  forVotingPower,
  againstVotingPower,
  approvalThreshold,
}: {
  forVotingPower: string;
  againstVotingPower: string;
  approvalThreshold: number;
}) => {
  const votedFor = Big(forVotingPower ?? 0);
  const votedAgainst = Big(againstVotingPower ?? 0);
  const num = votedFor;
  const den = votedFor.add(votedAgainst);

  if (den.eq(0)) {
    return false;
  }

  const div = num.div(den);
  const result = div.gte(Big(approvalThreshold).div(10000));

  return result;
};

export function getProposalStatus({
  status,
  quorumAmount,
  forVotingPower,
  againstVotingPower,
  abstainVotingPower,
  approvalThreshold,
  proposalType,
}: {
  status: string;
  quorumAmount: string;
  forVotingPower: string;
  againstVotingPower: string;
  abstainVotingPower: string;
  approvalThreshold: number;
  proposalType?: string;
}) {
  switch (status) {
    case ProposalStatus.Finished: {
      const quorumFulfilled = isQuorumFulfilled({
        quorumAmount,
        forVotingPower,
        againstVotingPower,
        abstainVotingPower,
      });
      const approvalFulfilled = isApprovalThresholdMet({
        forVotingPower,
        againstVotingPower,
        approvalThreshold,
      });
      return quorumFulfilled && approvalFulfilled
        ? ProposalDisplayStatus.Succeeded
        : ProposalDisplayStatus.Defeated;
    }
    case ProposalStatus.Created:
    case ProposalStatus.Approved:
    case ProposalStatus.Voting:
      return ProposalDisplayStatus.Active;
    default:
      return status;
  }
}

export function getProposalStatusColor(proposalStatus: string) {
  switch (proposalStatus) {
    case ProposalDisplayStatus.Succeeded:
      return {
        text: "text-green-600",
        bg: "bg-green-200",
      };
    case ProposalStatus.Rejected:
    case ProposalDisplayStatus.Defeated:
      return {
        text: "text-red-600",
        bg: "bg-red-200",
      };
    case ProposalDisplayStatus.Active:
      return {
        text: "text-blue-600",
        bg: "bg-blue-200",
      };
    default:
      return {
        text: "text-gray-600",
        bg: "bg-gray-200",
      };
  }
}

export const formatNearTime = (time: string | null | undefined) => {
  if (!time) return null;
  const date = new Date(Number(time) / 1000000);
  // Uses local time zone; "O" provides a short offset (e.g. GMT+2)
  return format(date, "yyyy-MM-dd h:mm aaa");
};

export const getProposalTimes = ({
  votingDurationNs,
  votingStartTimeNs,
  votingCreationTimeNs,
}: {
  votingDurationNs?: string | null;
  votingStartTimeNs?: string | null;
  votingCreationTimeNs?: string | null;
}) => {
  const endTimeNs =
    votingStartTimeNs && votingDurationNs
      ? Number(votingStartTimeNs) + Number(votingDurationNs)
      : null;

  return {
    createdTime: formatNearTime(votingCreationTimeNs),
    startTime: formatNearTime(votingStartTimeNs),
    endTime: formatNearTime(endTimeNs?.toString()),
  };
};

const QUORUM_FLOOR_IN_NEAR =
  process.env.NEXT_PUBLIC_NEAR_QUORUM_FLOOR_VENEAR ??
  DEFAULT_QUORUM_FLOOR_VENEAR;

export const getFormattedQuorumPercentage = () =>
  `${Number(DEFAULT_QUORUM_THRESHOLD_PERCENTAGE_BPS) / 100}%`;

export const getQuorumFloorYoctoNear = () =>
  parseNearAmount(QUORUM_FLOOR_IN_NEAR) ?? "0";

export const getTotalVotes = (
  forVotingPower: string,
  againstVotingPower: string,
  abstainVotingPower: string
) => {
  return Big(forVotingPower).plus(againstVotingPower).plus(abstainVotingPower);
};

export const isQuorumFulfilled = ({
  quorumAmount,
  forVotingPower,
  againstVotingPower,
  abstainVotingPower,
}: {
  quorumAmount: string;
  forVotingPower: string;
  againstVotingPower: string;
  abstainVotingPower: string;
}) => {
  const totalVotes = getTotalVotes(
    forVotingPower,
    againstVotingPower,
    abstainVotingPower
  );
  const result = totalVotes.gte(quorumAmount);
  return result;
};

export const getVotingDays = ({
  voting_duration_ns,
}: {
  voting_duration_ns: string;
}) => {
  // Preserve days wording for >= 1 day, otherwise provide a humanized unit
  const votingDays = convertNanoSecondsToDays(voting_duration_ns);
  if (votingDays >= 1) {
    return `${votingDays} ${votingDays === 1 ? "day" : "days"}`;
  }
  return formatNanoSecondsToTimeUnit(voting_duration_ns);
};

export const unpackProposal = <
  T extends {
    description?: string | null;
  },
>(
  proposal: T
): T & {
  metadata: ProposalMetadata;
  cleanDescription: string;
} => {
  const rawDescription = proposal.description || "";

  const { metadata, description } = decodeMetadata(rawDescription);

  return {
    ...proposal,
    metadata,
    cleanDescription: description,
  };
};
