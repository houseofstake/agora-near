"use client";

import { useState } from "react";
import { Switch } from "@/components/shared/Switch";

const voteFilterOptions = {
  ["Voters"]: {
    sortKey: "voters",
  },
  ["Hasn't voted"]: {
    sortKey: "nonVoters",
  },
};

import { useAnalytics } from "@/hooks/useAnalytics";

const ProposalVoteFilter = ({
  initialSelection,
  onSelectionChange,
}: {
  initialSelection: string;
  onSelectionChange: (value: string) => void;
}) => {
  const [value, setValue] = useState(initialSelection);
  const { trackProposalVoteFilterChanged } = useAnalytics();

  return (
    <Switch
      options={Object.entries(voteFilterOptions).map(([key]) => key)}
      selection={value}
      className="text-xs"
      onSelectionChanged={(value: any) => {
        setValue(value);
        onSelectionChange(value);
        trackProposalVoteFilterChanged({ filter_option: value });
      }}
    />
  );
};

export default ProposalVoteFilter;
