import React from "react";
import { Users } from "lucide-react";

export function VoterEngagementCard({
  voterEngagement,
}: {
  voterEngagement: {
    activeVp: string;
    occasionalVp: string;
    sleepingVp: string;
    activeVoters: string;
    occasionalVoters: string;
    sleepingVoters: string;
  };
}) {
  const activeNear = parseFloat(voterEngagement?.activeVp || "0") / 1e24 || 0;
  const occasionalNear =
    parseFloat(voterEngagement?.occasionalVp || "0") / 1e24 || 0;
  const sleepingNear =
    parseFloat(voterEngagement?.sleepingVp || "0") / 1e24 || 0;

  const totalNear = activeNear + occasionalNear + sleepingNear;

  const activePct = totalNear > 0 ? (activeNear / totalNear) * 100 : 0;
  const occasionalPct = totalNear > 0 ? (occasionalNear / totalNear) * 100 : 0;
  const sleepingPct = totalNear > 0 ? (sleepingNear / totalNear) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden flex flex-col items-center justify-between group h-full">
      <div className="w-full border-b border-gray-100 pb-4 mb-4 flex items-start justify-between">
        <div>
          <h4 className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest relative z-10">
            TVL Engagement Tiers
          </h4>
          <p className="text-xs text-gray-400 mt-1">
            Voting frequency of locked tokens
          </p>
        </div>
        <Users className="text-[#00E391] w-5 h-5" />
      </div>

      <div className="w-full flex-grow flex items-center justify-center my-4">
        <div className="w-full">
          {/* Stacked Bar container */}
          <div className="h-6 w-full rounded-full overflow-hidden flex shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] bg-gray-100">
            <div
              className="h-full bg-[#00E391] transition-all duration-1000 ease-out"
              style={{ width: `${activePct}%` }}
            />
            <div
              className="h-full bg-yellow-400 transition-all duration-1000 ease-out"
              style={{ width: `${occasionalPct}%` }}
            />
            <div
              className="h-full bg-[#FF4D4F] transition-all duration-1000 ease-out"
              style={{ width: `${sleepingPct}%` }}
            />
          </div>

          {/* Labels */}
          <div className="mt-8 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#00E391]" />
                <span className="font-semibold text-gray-800">
                  Active (+80%)
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-900 block">
                  {activeNear.toLocaleString("en-US", {
                    maximumFractionDigits: 1,
                  })}
                  M{" "}
                  <span className="text-xs text-gray-400 font-medium">VP</span>
                </span>
                <span className="text-xs text-gray-400">
                  {voterEngagement?.activeVoters || 0} Accounts
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="font-semibold text-gray-800">Occasional</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-900 block">
                  {occasionalNear.toLocaleString("en-US", {
                    maximumFractionDigits: 1,
                  })}
                  M{" "}
                  <span className="text-xs text-gray-400 font-medium">VP</span>
                </span>
                <span className="text-xs text-gray-400">
                  {voterEngagement?.occasionalVoters || 0} Accounts
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF4D4F]" />
                <span className="font-semibold text-gray-800">
                  Sleeping (Never/&lt;20%)
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-900 block">
                  {sleepingNear.toLocaleString("en-US", {
                    maximumFractionDigits: 1,
                  })}
                  M{" "}
                  <span className="text-xs text-gray-400 font-medium">VP</span>
                </span>
                <span className="text-xs text-gray-400 items-baseline">
                  {voterEngagement?.sleepingVoters || 0} Accounts
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
