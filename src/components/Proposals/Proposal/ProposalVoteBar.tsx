import { ProposalInfo } from "@/lib/contracts/types/voting";

export default function ProposalVoteBar({
  proposal,
}: {
  proposal: ProposalInfo;
}) {
  const hasVotes = proposal.total_votes.total_venear !== "0";

  const forVotes = Number(proposal.votes[0].total_venear);
  const againstVotes = Number(proposal.votes[1].total_venear);
  const abstainVotes = Number(proposal.votes[2]?.total_venear ?? "0");
  const totalVotes = forVotes + againstVotes + abstainVotes;

  // Threshold is at 50% of for+against votes (abstain doesn't count)
  const approvalPercentage = Number(proposal.approvalThreshold) / 10000;

  // Calculate threshold position based on approval percentage (50% or 66%)
  // Adjusted by the ratio of (For + Against) / Total, since the bar includes Abstain.
  const participatingVotes = forVotes;
  const forPlusAgainst = forVotes + againstVotes;
  const thresholdPosition =
    totalVotes > 0
      ? approvalPercentage * (participatingVotes / forPlusAgainst) * 100
      : approvalPercentage * 100;

  return (
    <div id="chartContainer" className="relative flex items-stretch gap-x-0.5">
      {hasVotes ? (
        <>
          {forVotes > 0 && (
            <div
              style={{ flex: forVotes / totalVotes }}
              className="min-w-[1px] bg-positive h-[10px]"
            ></div>
          )}
          {againstVotes > 0 && (
            <div
              style={{ flex: againstVotes / totalVotes }}
              className="min-w-[1px] bg-negative h-[10px]"
            ></div>
          )}
          {abstainVotes > 0 && (
            <div
              style={{ flex: abstainVotes / totalVotes }}
              className="min-w-[1px] bg-secondary h-[10px]"
            ></div>
          )}
        </>
      ) : (
        <div className="w-full bg-wash h-[10px]"></div>
      )}
      <div
        className="bg-primary h-4 w-[2px] absolute -top-[3px] z-50"
        style={{ left: `${thresholdPosition}%` }}
      />
    </div>
  );
}
