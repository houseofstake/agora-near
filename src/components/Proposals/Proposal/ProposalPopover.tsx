import checkIcon from "@/assets/check.svg";
import TokenAmount from "@/components/shared/TokenAmount";
import { NEAR_TOKEN } from "@/lib/constants";
import { ProposalInfo } from "@/lib/contracts/types/voting";
import {
  getProposalTimes,
  getTotalVotes,
  isApprovalThresholdMet,
  isQuorumFulfilled,
} from "@/lib/proposalUtils";
import { formatVotingPower } from "@/lib/utils";
import { X } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import ProposalVoteBar from "./ProposalVoteBar";
import Big from "big.js";

const ProposalPopover = ({ proposal }: { proposal: ProposalInfo }) => {
  const { createdTime, startTime, endTime } = getProposalTimes({
    votingDurationNs: proposal.voting_duration_ns,
    votingStartTimeNs: proposal.voting_start_time_ns,
    votingCreationTimeNs: proposal.creation_time_ns,
  });

  const totalRows = useMemo(() => {
    let row = 0;
    if (createdTime) row++;
    if (startTime) row++;
    if (endTime) row++;
    return row;
  }, [createdTime, startTime, endTime]);

  const quorum = proposal.quorumAmount ?? "0";

  const hasMetQuorum = isQuorumFulfilled({
    quorumAmount: quorum,
    forVotingPower: proposal.votes[0].total_venear,
    againstVotingPower: proposal.votes[1].total_venear,
    abstainVotingPower: proposal.votes[2]?.total_venear ?? "0",
  });
  const approvalThreshold = proposal.approvalThreshold
    ? Number(proposal.approvalThreshold)
    : 0;
  const hasMetThreshold = isApprovalThresholdMet({
    forVotingPower: proposal.votes[0].total_venear,
    againstVotingPower: proposal.votes[1].total_venear,
    approvalThreshold,
  });
  const forPlusAgainst = Big(proposal.votes[0].total_venear).add(
    proposal.votes[1].total_venear
  );
  const voteThresholdPercent = forPlusAgainst.eq(0)
    ? 0
    : Big(proposal.votes[0].total_venear).div(forPlusAgainst).mul(100);
  const apprThresholdPercent = approvalThreshold / 100;
  const totalVotes = getTotalVotes(
    proposal.votes[0].total_venear,
    proposal.votes[1].total_venear,
    proposal.votes[2]?.total_venear ?? "0"
  );

  return (
    <div className="flex flex-col font-inter font-semibold text-xs w-full max-w-[317px] sm:min-w-[317px] bg-wash">
      <ProposalVoteBar proposal={proposal} />
      <div className="flex flex-col gap-2 w-full mt-4">
        <div className="flex justify-between text-positive">
          {proposal.voting_options[0]}
          <AmountAndPercent
            amount={proposal.votes[0].total_venear}
            total={forPlusAgainst.toString()}
          />
        </div>
        <div className="text-negative flex justify-between">
          {proposal.voting_options[1]}
          <AmountAndPercent
            amount={proposal.votes[1].total_venear}
            total={forPlusAgainst.toString()}
          />
        </div>
        {proposal.voting_options.length > 2 && (
          <div className="text-secondary flex justify-between">
            {proposal.voting_options[2]}
            <AmountAndPercent
              amount={proposal.votes[2].total_venear}
              total={proposal.total_votes.total_venear}
              showPercent={false}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 w-[calc(100%+32px)] mt-4 bg-wash border-t border-b border-line -ml-4 p-4">
        <div className="flex justify-between">
          <div className="flex items-center gap-1 text-secondary font-semibold text-xs">
            Quorum
          </div>
          <div className="flex items-center gap-1 ">
            {hasMetQuorum ? (
              <Image width="12" height="12" src={checkIcon} alt="check icon" />
            ) : (
              <X className="h-4 w-4 text-negative" />
            )}
            <p className="text-xs font-semibold text-secondary">
              <TokenAmount amount={totalVotes.toFixed(0)} hideCurrency /> /{" "}
              <TokenAmount amount={quorum} hideCurrency />
              Required
            </p>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-row gap-1 text-secondary font-semibold text-xs">
            Threshold
          </div>
          <div className="flex flex-row gap-1 ">
            {hasMetThreshold ? (
              <Image width="12" height="12" src={checkIcon} alt="check icon" />
            ) : (
              <X className="h-4 w-4 text-negative" />
            )}
            <p className="text-xs font-semibold text-secondary">
              {voteThresholdPercent.toFixed(2)}% / {`${apprThresholdPercent}%`}{" "}
              Required
            </p>
          </div>
        </div>
      </div>
      <ol className="overflow-hidden space-y-6 w-[calc(100%+32px)] bg-wash -ml-4 p-4 pb-6 rounded-br-lg rounded-bl-lg">
        {createdTime && (
          <StepperRow
            label="Proposal created"
            value={createdTime}
            isLastStep={totalRows === 1}
          />
        )}
        {startTime && (
          <StepperRow
            label="Voting period start"
            value={startTime}
            isLastStep={totalRows === 2}
          />
        )}
        {endTime && (
          <StepperRow
            label="Voting period end"
            value={endTime}
            isLastStep={totalRows === 3}
          />
        )}
      </ol>
    </div>
  );
};

export default ProposalPopover;

function AmountAndPercent({
  amount,
  total,
  showPercent = true,
}: {
  amount: string;
  total: string;
  showPercent?: boolean;
}) {
  const parsedTotal = Big(total);
  const parsedAmount = Big(amount);

  const percent = parsedTotal.eq(0)
    ? "0"
    : parsedAmount.div(parsedTotal).mul(100).toFixed(2);

  // Convert yocto NEAR to NEAR and format with the scaling
  const amountNumber = Number(amount) / Math.pow(10, NEAR_TOKEN.decimals);
  const formattedAmount = formatVotingPower(amountNumber, amountNumber);

  return (
    <span>
      {formattedAmount}
      {showPercent && ` (${percent}%)`}
    </span>
  );
}

const StepperRow = ({
  label,
  value,
  isActive,
  isCompleted,
  isLastStep,
}: {
  label: string;
  value: string;
  isActive?: boolean;
  isCompleted?: boolean;
  isLastStep?: boolean;
}) => {
  return (
    <li
      className={`relative flex-1  ${!isLastStep && "after:content-[''] after:w-[1.5px] after:h-[35px]  after:bg-line after:inline-block after:absolute after:top-3 after:left-0.5"} `}
    >
      <div className="flex items-center gap-x-3">
        <div
          className={`w-1.5 h-1.5 rounded-full ${isCompleted ? "bg-black" : isActive ? "bg-blue-600" : "bg-primary/30"}`}
        />

        <div className="w-full flex items-center justify-between text-xs font-semibold">
          <div
            className={`${isCompleted ? "text-primary" : isActive ? "text-blue-600" : "text-secondary"} flex items-center gap-x-1`}
          >
            {label}
          </div>

          <p className="text-xs font-medium text-secondary">{value}</p>
        </div>
      </div>
    </li>
  );
};
