import Markdown from "@/components/shared/Markdown/Markdown";
import { ProposalInfo, ProposalStatus } from "@/lib/contracts/types/voting";

import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import styles from "./ProposalDescription.module.scss";
import ProposalChart from "../ProposalPage/ProposalChart/ProposalChart";
import { ProposalTypeBadge } from "@/components/Proposals/ProposalTypeBadge";
import { truncateAddress, truncateMiddle } from "@/lib/text";

export default function ProposalDescription({
  proposal,
}: {
  proposal: ProposalInfo;
}) {
  return (
    <div className="flex flex-col gap-4 w-full min-w-0 flex-1 break-words">
      <div className="flex-col items-start min-w-0">
        <div className="text-xs font-semibold text-secondary flex items-center gap-2 mb-1">
          <ProposalTypeBadge type={proposal.proposalType} />
          <span className="flex items-center">
            Proposal by {proposal.proposer_id}
            {proposal.link && (
              <a
                href={
                  proposal.link.startsWith("http") ||
                  proposal.link.startsWith("https")
                    ? proposal.link
                    : `https://${proposal.link}`
                }
                target="_blank"
                rel="noreferrer noopener"
              >
                <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
              </a>
            )}
          </span>
        </div>
        <h2
          className="font-black text-2xl text-primary max-w-full"
          style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
        >
          {proposal.title}
        </h2>
      </div>
      {proposal.status !== ProposalStatus.Created &&
        proposal.status !== ProposalStatus.Rejected && (
          <ProposalChart proposal={proposal} />
        )}
      <div className="flex flex-col gap-2">
        <div className={styles.proposal_description_md}>
          <Markdown content={proposal.description || ""} />
        </div>
      </div>
    </div>
  );
}
