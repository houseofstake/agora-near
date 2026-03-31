"use client";

import React from "react";
import { ChevronDown, FileText } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { fetchApprovedProposals } from "@/lib/api/proposal/requests";

interface ProposalAnalyticDropdownProps {
  onSelect: (proposalId: string | null) => void;
}

export const ProposalAnalyticDropdown: React.FC<
  ProposalAnalyticDropdownProps
> = ({ onSelect }) => {
  const { data, isLoading: loading } = useQuery({
    queryKey: ["approved-proposals"],
    queryFn: () => fetchApprovedProposals(100, 1),
  });

  const proposals = data?.proposals || [];

  return (
    <div className="relative w-full flex flex-col md:flex-row md:items-center gap-4">
      <label
        htmlFor="proposal-select"
        className="flex items-center gap-2 text-sm font-bold text-gray-800 whitespace-nowrap"
      >
        <FileText className="w-4 h-4 text-[#00E391]" />
        Select a Historical Proposal
      </label>

      <div className="relative group flex-1 min-w-0">
        <select
          id="proposal-select"
          disabled={loading}
          onChange={(e) => {
            const val = e.target.value;
            onSelect(val === "" ? null : val);
          }}
          className="w-full appearance-none bg-white border border-gray-200 hover:border-[#00E391]/50 text-gray-800 text-sm md:text-base rounded-2xl px-5 py-3 pr-12 focus:outline-none focus:ring-4 focus:ring-[#00E391]/10 focus:border-[#00E391] transition-all shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)] font-semibold disabled:opacity-50 disabled:bg-gray-50/50 cursor-pointer truncate"
        >
          <option value="">
            {loading
              ? "Loading proposals catalog..."
              : "-- Choose a Governance Proposal --"}
          </option>
          {proposals.map((p) => (
            <option key={p.proposalId} value={p.proposalId} title={`#${p.proposalId} - ${p.proposalTitle || `Unnamed Proposal`}`}>
              #{p.proposalId} - {p.proposalTitle || `Unnamed Proposal`}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-5 pointer-events-none text-gray-400 group-hover:text-[#00E391] transition-colors bg-gradient-to-l from-white via-white to-transparent rounded-r-2xl">
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
