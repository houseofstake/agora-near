import {
  ProposalDisplayStatus,
  ProposalInfo,
} from "@/lib/contracts/types/voting";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getProposalStatus,
  getProposalStatusColor,
  isQuorumFulfilled,
} from "@/lib/proposalUtils";
import { cn } from "@/lib/utils";
import { InfoIcon } from "lucide-react";
import ProposalTimeStatus from "../Proposals/ProposalTimeStatus";
import { QuorumExplanation } from "./QuorumExplanation";

export default function ProposalStatusDetail({
  proposal,
  className,
}: {
  proposal: ProposalInfo;
  className?: string;
}) {
  const quorum = proposal.quorumAmount || "0";

  const status = getProposalStatus({
    status: proposal.status,
    quorumAmount: quorum,
    forVotingPower: proposal.votes[0].total_venear,
    againstVotingPower: proposal.votes[1].total_venear,
    abstainVotingPower: proposal.votes[2]?.total_venear ?? "0",
    proposalType: proposal.proposalType,
    approvalThreshold: Number(proposal.approvalThreshold),
  });

  const isDefeated = status === ProposalDisplayStatus.Defeated;

  const { text, bg } = getProposalStatusColor(status);

  const quorumFulfilled = isQuorumFulfilled({
    quorumAmount: quorum,
    forVotingPower: proposal.votes[0].total_venear,
    againstVotingPower: proposal.votes[1].total_venear,
    abstainVotingPower: proposal.votes[2]?.total_venear ?? "0",
  });

  return (
    <div
      className={cn(
        className,
        "flex flex-row justify-between items-center gap-4 bg-wash px-4 py-2 text-secondary rounded-b-md text-xs"
      )}
    >
      <div>
        <p
          className={cn(
            text,
            bg,
            "flex items-center gap-2 rounded-sm px-1 py-0.5 font-semibold"
          )}
        >
          {status.toUpperCase()}
          {!quorumFulfilled && isDefeated && (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger>
                  <InfoIcon size={14} />
                </TooltipTrigger>
                <TooltipContent className="max-w-[400px]">
                  <QuorumExplanation quorumAmount={quorum} />{" "}
                  <a
                    className="text-blue-500"
                    href="https://hos-docs.vercel.app/docs/overview/faqs#quorum-requirements"
                  >
                    Learn more here
                  </a>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </p>
      </div>
      <div className="font-normal">
        <ProposalTimeStatus
          votingDurationNs={proposal.voting_duration_ns}
          votingStartTimeNs={proposal.voting_start_time_ns ?? ""}
          votingCreationTimeNs={proposal.creation_time_ns ?? ""}
          status={proposal.status}
        />
      </div>
    </div>
  );
}
