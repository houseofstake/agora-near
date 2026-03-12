// Use client for local timezone instead of server timezone
"use client";

import { HStack } from "@/components/Layout/Stack";
import { ProposalStatus } from "@/lib/contracts/types/voting";
import { getProposalTimes } from "@/lib/proposalUtils";
import { ProposalCountdown } from "../Proposal/ProposalCountdown";

export default function ProposalTimeStatus({
  votingDurationNs,
  votingStartTimeNs,
  votingCreationTimeNs,
  status,
}: {
  votingDurationNs: string;
  votingStartTimeNs: string;
  votingCreationTimeNs: string;
  status: string;
}) {
  const {
    createdTime: proposalCreateTimeDisplay,
    startTime: proposalStartTimeDisplay,
    endTime: proposalEndTimeDisplay,
  } = getProposalTimes({
    votingDurationNs,
    votingStartTimeNs,
    votingCreationTimeNs,
  });

  switch (status) {
    case ProposalStatus.Created:
      return (
        <HStack gap={1} className="whitespace-nowrap">
          Created {proposalCreateTimeDisplay}
        </HStack>
      );

    case ProposalStatus.Voting:
      if (!proposalEndTimeDisplay) return null;
      return (
        <ProposalCountdown
          votingStartTimeNs={votingStartTimeNs}
          votingDurationNs={votingDurationNs}
          status={status}
          endTimeDisplay={proposalEndTimeDisplay}
          label="Closes"
        />
      );

    case ProposalStatus.Rejected:
      return <HStack gap={1}>Rejected</HStack>;

    case ProposalStatus.Approved:
      return (
        <HStack gap={1} className="whitespace-nowrap">
          Starts {proposalStartTimeDisplay}
        </HStack>
      );

    case ProposalStatus.Finished:
      return (
        <HStack gap={1} className="whitespace-nowrap">
          Finished {proposalEndTimeDisplay}
        </HStack>
      );
  }
}
