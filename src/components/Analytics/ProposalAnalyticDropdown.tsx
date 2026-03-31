"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, FileText } from "lucide-react";

interface ProposalAnalyticDropdownProps {
  onSelect: (proposalId: string | null) => void;
}

export const ProposalAnalyticDropdown: React.FC<
  ProposalAnalyticDropdownProps
> = ({ onSelect }) => {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("@/lib/api/proposal/requests").then(({ fetchApprovedProposals }) => {
      fetchApprovedProposals(100, 1)
        .then((data) => {
          if (data && data.proposals) {
            setProposals(data.proposals);
          }
        })
        .catch((err) => console.error("Error fetching proposals:", err))
        .finally(() => setLoading(false));
    });
  }, []);

  return (
    <div className="relative w-full max-w-xl">
      <label
        htmlFor="proposal-select"
        className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3"
      >
        <FileText className="w-4 h-4 text-[#00E391]" />
        Select a Historical Proposal
      </label>

      <div className="relative group">
        <select
          id="proposal-select"
          disabled={loading}
          onChange={(e) => {
            const val = e.target.value;
            onSelect(val === "" ? null : val);
          }}
          className="w-full appearance-none bg-white border border-gray-200 hover:border-[#00E391]/50 text-gray-800 text-sm md:text-base rounded-2xl px-5 py-4 pr-12 focus:outline-none focus:ring-4 focus:ring-[#00E391]/10 focus:border-[#00E391] transition-all shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)] font-semibold disabled:opacity-50 disabled:bg-gray-50/50 cursor-pointer"
        >
          <option value="">
            {loading
              ? "Loading proposals catalog..."
              : "-- Choose a Governance Proposal --"}
          </option>
          {proposals.map((p) => (
            <option key={p.proposalId} value={p.proposalId}>
              #{p.proposalId} - {p.proposalTitle || `Unnamed Proposal`}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-5 pointer-events-none text-gray-400 group-hover:text-[#00E391] transition-colors">
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
