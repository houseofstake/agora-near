import React from "react";
import { Users, Info } from "lucide-react";
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
        <div className="flex items-center gap-2">
          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest relative z-10">
            TVL Engagement Tiers
          </h4>
          <TooltipWithTap
            content={
              <p className="text-xs text-white max-w-xs text-center p-1">
                Voting frequency of locked tokens
              </p>
            }
          >
            <Info className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
          </TooltipWithTap>
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
            {[
              { label: "Active (+80%)", color: "bg-[#00E391]", near: activeNear, accounts: voterEngagement?.activeVoters },
              { label: "Occasional", color: "bg-yellow-400", near: occasionalNear, accounts: voterEngagement?.occasionalVoters },
              { label: "Sleeping (Never/<20%)", color: "bg-[#FF4D4F]", near: sleepingNear, accounts: voterEngagement?.sleepingVoters },
            ].map((tier, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${tier.color}`} />
                  <span className="font-semibold text-gray-800">{tier.label}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-900 block">
                    {tier.near === 0
                      ? "0"
                      : tier.near >= 1_000_000
                      ? `${(tier.near / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 1 })}M`
                      : tier.near >= 1_000
                      ? `${(tier.near / 1_000).toLocaleString("en-US", { maximumFractionDigits: 1 })}k`
                      : tier.near.toLocaleString("en-US", { maximumFractionDigits: 0 })}{" "}
                    <span className="text-xs text-gray-400 font-medium">VP</span>
                  </span>
                  <span className="text-xs text-gray-400">
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
