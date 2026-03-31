"use client";

import React from "react";
import { CheckCircle2, User } from "lucide-react";
import { convertYoctoToNear, formatVotingPower } from "@/lib/utils";

interface VotingActivityStat {
  isEndorsed: boolean;
  activeVoters: string;
  uniqueParticipatingVP: string;
}

interface VotingActivityCardProps {
  data: VotingActivityStat[];
}

export const VotingActivityCard: React.FC<VotingActivityCardProps> = ({
  data,
}) => {
  if (!data) {
    return (
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center p-8 text-sm text-gray-400 bg-gray-50/50 rounded-2xl border border-gray-100">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#00E391] animate-spin mb-4"></div>
          Analyzing voting activity...
        </div>
      </div>
    );
  }

  // Get endorsed vs non-endorsed active voters (count)
  const endorsedVoters = data.find((d) => d.isEndorsed)?.activeVoters || "0";
  const regularVoters = data.find((d) => !d.isEndorsed)?.activeVoters || "0";

  // Get endorsed vs non-endorsed active voting power (yoctoNEAR -> NEAR)
  const rawEndorsedVpy =
    data.find((d) => d.isEndorsed)?.uniqueParticipatingVP || "0";
  const rawRegularVpy =
    data.find((d) => !d.isEndorsed)?.uniqueParticipatingVP || "0";

  const endorsedVp = parseFloat(convertYoctoToNear(rawEndorsedVpy || "0")) || 0;
  const regularVp = parseFloat(convertYoctoToNear(rawRegularVpy || "0")) || 0;

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-start justify-between relative z-10 mb-4">
          <div>
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              Endorsed Delegates
            </h4>
          </div>
          <div className="p-2 bg-[#00E391]/10 rounded-lg border border-[#00E391]/20">
            <CheckCircle2 className="w-4 h-4 text-[#00E391]" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-end justify-between border-b border-[#00E391]/10 pb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Active Volume
            </span>
            <span className="text-xl font-black text-gray-900">
              {formatVotingPower(endorsedVp, endorsedVp)}
            </span>
          </div>
          <div className="flex items-end justify-between border-b border-[#00E391]/10 pb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Active Voters
            </span>
            <span className="text-xl font-black text-gray-900">
              {Number(endorsedVoters).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-start justify-between relative z-10 mb-4">
          <div>
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              Standard Accounts
            </h4>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
            <User className="w-4 h-4 text-gray-500" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-end justify-between border-b border-gray-50 pb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Active Volume
            </span>
            <span className="text-xl font-black text-gray-900">
              {formatVotingPower(regularVp, regularVp)}
            </span>
          </div>
          <div className="flex items-end justify-between border-b border-gray-50 pb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Active Voters
            </span>
            <span className="text-xl font-black text-gray-900">
              {Number(regularVoters).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
