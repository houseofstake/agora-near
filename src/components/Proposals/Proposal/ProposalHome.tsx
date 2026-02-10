"use client";

import AgoraLoader from "@/components/shared/AgoraLoader/AgoraLoader";
import { useProposal } from "@/hooks/useProposal";
import { useProposalConfig } from "@/hooks/useProposalConfig";
import { useProposalQuorum } from "@/hooks/useProposalQuorum";

import { ProposalStatus } from "@/lib/contracts/types/voting";
import { useMemo } from "react";
import { PendingProposal } from "./PendingProposal";
import ProposalDescription from "./ProposalDescription";
import ProposalVoteResult from "./ProposalVoteResult";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useEffect, useRef } from "react";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default function ProposalHome({ proposalId }: { proposalId: string }) {
  const { proposal, isLoading: isLoadingProposal } = useProposal(proposalId);
  const { config, isLoading: isConfigLoading } = useProposalConfig();
  const { quorumAmount, isLoading: isLoadingQuorumAmount } = useProposalQuorum({
    proposalId,
  });

  const proposalWithQuorum = useMemo(() => {
    return proposal
      ? {
          ...proposal,
          quorumAmount,
          proposalType: proposal.metadata.proposalType,
          approvalThreshold: proposal.metadata.approvalThreshold.toString(),
        }
      : null;
  }, [proposal, quorumAmount]);

  const finalProposal = useMemo(() => {
    if (!proposalWithQuorum) return null;
    return {
      ...proposalWithQuorum,
      description:
        proposalWithQuorum.cleanDescription || proposalWithQuorum.description,
    };
  }, [proposalWithQuorum]);
  const isLoading =
    isLoadingProposal || isConfigLoading || isLoadingQuorumAmount;

  const { trackProposalDetailViewed } = useAnalytics();
  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (!isLoading && finalProposal && !hasTrackedView.current) {
      hasTrackedView.current = true;
      trackProposalDetailViewed({
        proposal_id: proposalId,
        proposal_status: finalProposal.status,
        proposal_category: finalProposal.proposalType || "unknown",
        // time_to_deadline_hours: calculate if needed, skipping for now as it requires parsing
      });
    }
  }, [isLoading, finalProposal, proposalId, trackProposalDetailViewed]);

  if (isLoading) {
    return <AgoraLoader />;
  }

  if (!finalProposal || !config) {
    return <div>Proposal not found</div>;
  }

  if (finalProposal.status === ProposalStatus.Created) {
    return <PendingProposal proposal={finalProposal} />;
  }

  return (
    <div className="flex flex-col items-center mt-12">
      <div className="flex flex-col gap-6 w-full max-w-desktop">
        <div className="flex flex-col md:flex-row gap-8 relative items-start justify-between">
          <div className="flex-1 min-w-0">
            <ProposalDescription proposal={finalProposal} />
          </div>
          <div className="flex-1 md:flex-none md:w-[24rem] min-w-0">
            <ProposalVoteResult proposal={finalProposal} config={config} />
          </div>
        </div>
        {/* Mobile-only spacer to prevent overlap with modal/circle */}
        <div className="block md:hidden" style={{ height: 65 }} />
      </div>
    </div>
  );
}
