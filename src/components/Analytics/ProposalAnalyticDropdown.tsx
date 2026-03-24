"use client";

import React, { useEffect, useState } from "react";

interface ProposalAnalyticDropdownProps {
  onSelect: (proposalId: string | null) => void;
}

export const ProposalAnalyticDropdown: React.FC<
  ProposalAnalyticDropdownProps
> = ({ onSelect }) => {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/proposals?status=closed")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.proposals) {
          setProposals(data.proposals);
        }
      })
      .catch((err) => console.error("Error fetching proposals:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative w-full max-w-xl">
      <label
        htmlFor="proposal-select"
        className="block text-sm font-semibold text-gray-700 mb-2"
      >
        Select a Historical Proposal
      </label>

      <div className="relative">
        <select
          id="proposal-select"
          disabled={loading}
          onChange={(e) => {
            const val = e.target.value;
            onSelect(val === "" ? null : val);
          }}
          className="w-full appearance-none bg-white border border-gray-300 hover:border-gray-400 text-gray-800 text-sm rounded-xl px-4 py-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#00E391] focus:border-transparent transition-all shadow-sm font-medium disabled:opacity-50 disabled:bg-gray-50"
        >
          <option value="">
            {loading
              ? "Loading proposals catalog..."
              : "-- Choose a Governance Proposal --"}
          </option>
          {proposals.map((p) => (
            <option key={p.proposalId} value={p.proposalId}>
              #{p.proposalId} - {p.title || `Unnamed Proposal`}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
