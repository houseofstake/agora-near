"use client";

import ProposalChart, {
  ChartSkeleton,
} from "@/components/Proposals/ProposalPage/ProposalChart/ProposalChart";
import { useProposal } from "@/hooks/useProposal";

type ProposalVisualizationCardProps = {
  proposalIdForVisualization?: string;
};

export const ProposalVisualizationCard = ({
  proposalIdForVisualization = "25",
}: ProposalVisualizationCardProps) => {
  const { proposal, isLoading } = useProposal(proposalIdForVisualization);

  if (isLoading || !proposal) {
    return (
      <div className="rounded-lg border border-line bg-neutral p-4">
        <div className="mb-3 text-xs font-semibold text-[#404040]">Proposal Visualization</div>
        <ChartSkeleton />
      </div>
    );
  }

  return <ProposalChart proposal={proposal} />;
};

