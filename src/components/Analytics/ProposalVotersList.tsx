"use client";

import React, { useEffect, useState } from "react";
import { fetchProposalVotes } from "@/lib/api/proposal/requests";
import { ProposalVotingHistoryRecord } from "@/lib/api/proposal/types";
import Link from "next/link";
import { ExternalLink, UserCircle2 } from "lucide-react";

interface ProposalVotersListProps {
  proposalId: string;
}

export const ProposalVotersList: React.FC<ProposalVotersListProps> = ({
  proposalId,
}) => {
  const [votes, setVotes] = useState<ProposalVotingHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch top 100 voters mapped to this proposal
    fetchProposalVotes(proposalId, 100, 1)
      .then((data) => {
        if (data && data.votes) {
          // Some APIs might return snake_case (voting_power), we handle safely
          setVotes(data.votes);
        }
      })
      .catch((err) => console.error("Error fetching voters:", err))
      .finally(() => setLoading(false));
  }, [proposalId]);

  if (loading) {
    return (
      <div className="mt-8 pt-10 border-t border-gray-100/80 w-full flex flex-col items-center">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[#00E391] animate-spin mb-3"></div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">
          Loading Voters...
        </span>
      </div>
    );
  }

  if (votes.length === 0) {
    return (
      <div className="mt-8 pt-10 border-t border-gray-100/80 w-full flex flex-col items-center">
        <span className="text-sm font-bold text-gray-500">
          No voters found for this proposal.
        </span>
      </div>
    );
  }

  const formatVoteValue = (vp: string | undefined | null) => {
    if (!vp) return "0";
    const rawVal = parseFloat(vp);
    // The backend returns values in yoctoNEAR (24 decimals), so we convert it first
    const nearVal = rawVal / 1e24;

    // Rough abbreviation if large
    if (nearVal >= 1e6) return (nearVal / 1e6).toFixed(2) + "M";
    if (nearVal >= 1e3) return (nearVal / 1e3).toFixed(2) + "k";
    return nearVal.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  return (
    <div className="mt-12 pt-10 border-t border-gray-100/80 w-full">
      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 px-2 flex justify-between items-center">
        <span>Individual Delegate Voters</span>
        <span className="bg-[#00E391]/15 text-teal-800 font-extrabold px-3 py-1.5 rounded-full text-[10px] tracking-normal">
          {votes.length} Participants
        </span>
      </h4>
      <div className="max-h-[360px] overflow-y-auto pr-3 space-y-3 custom-scrollbar">
        {votes.map((v, i) => {
          // Handle backend potential snake_case vs frontend camelCase mapping
          const accountId = v.accountId || (v as any).voter_id;
          const voteOption = v.voteOption || (v as any).vote_option;
          const rawVotingPower = v.votingPower || (v as any).voting_power;

          if (!accountId) return null;

          return (
            <Link
              key={`${accountId}-${i}`}
              href={`/delegates/${accountId}`}
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/40 hover:bg-white rounded-2xl border border-gray-100 hover:border-[#00E391]/40 hover:shadow-[0_4px_20px_-4px_rgba(0,227,145,0.15)] transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:border-[#00E391]/30 transition-colors">
                  <UserCircle2 className="w-6 h-6 text-gray-400 group-hover:text-[#00E391] transition-colors" />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-bold text-gray-800 break-all truncate max-w-[180px] md:max-w-xs">
                    {accountId}
                  </p>
                  <p className="text-xs font-semibold text-gray-500 capitalize flex items-center gap-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        String(voteOption) === "0"
                          ? "bg-[#00E391]"
                          : "bg-red-400"
                      }`}
                    ></span>
                    Voted{" "}
                    {String(voteOption) === "0"
                      ? "For"
                      : String(voteOption) === "1"
                        ? "Against"
                        : "Abstain"}
                  </p>
                </div>
              </div>

              <div className="mt-4 sm:mt-0 flex items-center justify-end gap-3 sm:w-auto w-full border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
                <div className="flex flex-col items-end">
                  <span className="text-[13px] font-black text-gray-800">
                    {formatVoteValue(rawVotingPower)}
                  </span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    veNEAR
                  </span>
                </div>
                <div className="hidden sm:flex w-8 h-8 rounded-full bg-gray-50 items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-[#00E391]/10 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  <ExternalLink className="w-4 h-4 text-[#00E391]" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,227,145,0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,227,145,0.4);
        }
      `,
        }}
      />
    </div>
  );
};
