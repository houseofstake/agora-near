"use client";

import DelegateStatementContainer from "./DelegateStatementContainer";
import TopIssues from "./TopIssues";
import { useNearSocialProfile } from "@/hooks/useNearSocialProfile";
import { getNearSocialContractId } from "@/lib/nearSocial";

interface Props {
  statement: string;
  topIssues: {
    value: string;
    type: string;
  }[];
  address: string;
}

const DelegateStatementWrapper = ({ statement, topIssues, address }: Props) => {
  const { data: nearSocialProfile } = useNearSocialProfile(address);
  const socialContractId = getNearSocialContractId();
  // Only show indicator if statement is on-chain (not just name)
  const hasOnChainStatement = Boolean(nearSocialProfile?.statement);
  const resolvedStatement = statement || nearSocialProfile?.statement || "";

  // Resolve top issues: prefer off-chain, fallback to on-chain (filter empty values)
  const onChainTopIssues = Array.isArray(nearSocialProfile?.topIssues)
    ? nearSocialProfile.topIssues.filter((issue) => issue.value)
    : [];
  const filteredOffChainTopIssues = topIssues?.filter((issue) => issue.value) ?? [];
  const resolvedTopIssues =
    filteredOffChainTopIssues.length > 0
      ? filteredOffChainTopIssues
      : onChainTopIssues;

  return (
    <>
      {hasOnChainStatement && (
        <div
          className="mb-3 flex items-center gap-2 text-xs text-positive"
          title={`This delegate statement is also stored on Near Social (${socialContractId})`}
        >
          <span className="w-2 h-2 bg-positive rounded-full" />
          On-chain statement
        </div>
      )}
      <DelegateStatementContainer statement={resolvedStatement} address={address} />
      {resolvedStatement && (
        <>
          <TopIssues topIssues={resolvedTopIssues} />
        </>
      )}
    </>
  );
};

export const DelegateStatementSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 animate-pulse p-12 rounded-lg bg-tertiary/10">
      <div className="h-4 w-1/2 bg-tertiary/20 rounded-md"></div>
      <div className="h-4 w-1/3 bg-tertiary/20 rounded-md"></div>
    </div>
  );
};

export default DelegateStatementWrapper;
