import React from "react";
import { Users } from "lucide-react";
import { convertYoctoToNear, formatVotingPower } from "@/lib/utils";
import { TooltipWithTap } from "@/components/ui/tooltip-with-tap";
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
  const activeNear =
    parseFloat(convertYoctoToNear(voterEngagement?.activeVp || "0")) || 0;
  const occasionalNear =
    parseFloat(convertYoctoToNear(voterEngagement?.occasionalVp || "0")) || 0;
  const sleepingNear =
    parseFloat(convertYoctoToNear(voterEngagement?.sleepingVp || "0")) || 0;

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
        <TooltipWithTap
          content={
            <p className="max-w-xs text-xs font-medium text-center">
              Classifies accounts by historical voting frequency: Active (≥80%),
              Occasional, or Sleeping (≤20%).
            </p>
          }
          side="left"
        >
          <div className="cursor-pointer p-1">
            <Users className="text-[#00E391] w-5 h-5 hover:opacity-80 transition-opacity" />
          </div>
        </TooltipWithTap>
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
            {[
              {
                label: "Active (+80%)",
                color: "bg-[#00E391]",
                near: activeNear,
                accounts: voterEngagement?.activeVoters,
              },
              {
                label: "Occasional",
                color: "bg-yellow-400",
                near: occasionalNear,
                accounts: voterEngagement?.occasionalVoters,
              },
              {
                label: "Sleeping (Never/<20%)",
                color: "bg-[#FF4D4F]",
                near: sleepingNear,
                accounts: voterEngagement?.sleepingVoters,
              },
            ].map((tier, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${tier.color}`} />
                  <span className="font-semibold text-gray-800">
                    {tier.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-right justify-end flex-wrap">
                  <span className="font-bold text-gray-900 whitespace-nowrap">
                    {formatVotingPower(tier.near, tier.near)}{" "}
                    <span className="text-[10px] text-gray-400 font-medium uppercase">
                      VP
                    </span>
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium bg-gray-50 px-2 py-0.5 rounded border border-gray-100 whitespace-nowrap">
                    {tier.accounts || 0} Accounts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
