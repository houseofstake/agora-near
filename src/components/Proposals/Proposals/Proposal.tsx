import Link from "next/link";

import { Proposal as ProposalType } from "@/lib/api/proposal/types";
import { cn } from "@/lib/utils";
import { memo } from "react";
import ProposalStatus from "./ProposalStatus";
import { ProposalStatusText } from "./ProposalStatusText";
import ProposalTimeStatus from "./ProposalTimeStatus";
import { ProposalTypeBadge } from "../ProposalTypeBadge";
import { truncateAddress } from "@/lib/text";

export const Proposal = memo(({ proposal }: { proposal: ProposalType }) => {
  return (
    <Link key={proposal.id} href={`/proposals/${proposal.proposalId}`}>
      <div className="border-b border-line items-center flex flex-row bg-neutral">
        <div
          className={cn(
            "flex flex-col whitespace-nowrap overflow-ellipsis overflow-hidden py-4 px-6",
            "w-full items-start justify-center"
          )}
        >
          <div className="flex flex-row items-center text-xs text-secondary gap-1">
            <div className="hidden sm:inline">
              Proposal by {truncateAddress(proposal.creatorId)}
            </div>
            <div className="block sm:hidden">
              <ProposalStatusText proposal={proposal} />
            </div>
            <ProposalTypeBadge type={proposal.proposalType} />
          </div>
          <div className="overflow-ellipsis overflow-visible whitespace-normal break-words text-primary mt-1">
            {(proposal.proposalTitle ?? "").length > 80
              ? `${proposal.proposalTitle?.slice(0, 80)}...`
              : proposal.proposalTitle}
          </div>
        </div>
        <div className="flex-col whitespace-nowrap overflow-visible py-4 px-6 w-fit flex-start justify-center hidden sm:block">
          <div className="flex flex-col items-end">
            <div className="text-xs text-secondary">
              <ProposalTimeStatus
                votingDurationNs={proposal.votingDurationNs ?? "0"}
                votingStartTimeNs={proposal.votingStartTimeNs ?? "0"}
                votingCreationTimeNs={proposal.votingCreatedAtNs ?? "0"}
                status={proposal.status ?? ""}
              />
            </div>
            <ProposalStatusText proposal={proposal} />
          </div>
        </div>
        <div className="flex-col whitespace-nowrap overflow-visible py-4 px-6 w-fit flex-start justify-center hidden lg:block">
          <div className="overflow-hidden overflow-ellipsis">
            <ProposalStatus proposal={proposal} />
          </div>
        </div>
      </div>
    </Link>
  );
});

Proposal.displayName = "Proposal";
