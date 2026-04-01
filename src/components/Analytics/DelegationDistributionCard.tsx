"use client";

import React, { useMemo } from "react";
import Big from "big.js";
import { UserPlus, UserCircle } from "lucide-react";
import { convertYoctoToNear, formatVotingPower } from "@/lib/utils";
import { TooltipWithTap } from "@/components/ui/tooltip-with-tap";

export interface DelegationStatusBreakdownRow {
  isActivelyDelegating: boolean;
  uniqueAddresses: number | string | bigint;
  totalVotingPower: string;
}

interface DelegationDistributionCardProps {
  breakdown?: DelegationStatusBreakdownRow[];
}

function addressCount(v: unknown): number {
  if (typeof v === "bigint") return Number(v);
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") return parseInt(v, 10) || 0;
  return 0;
}

export const DelegationDistributionCard: React.FC<
  DelegationDistributionCardProps
> = ({ breakdown = [] }) => {
  const { activeVolume, inactiveVolume, activeAddresses, inactiveAddresses } =
    useMemo(() => {
      const rows = breakdown;
      let activeNear = Big(0);
      let inactiveNear = Big(0);
      let activeAddr = 0;
      let inactiveAddr = 0;

      for (const row of rows) {
        const nearStr = convertYoctoToNear(row.totalVotingPower || "0");
        const add = Big(nearStr || "0");
        const addrs = addressCount(row.uniqueAddresses);
        if (row.isActivelyDelegating === true) {
          activeNear = activeNear.add(add);
          activeAddr += addrs;
        } else {
          inactiveNear = inactiveNear.add(add);
          inactiveAddr += addrs;
        }
      }

      return {
        activeVolume: parseFloat(activeNear.toFixed(18)),
        inactiveVolume: parseFloat(inactiveNear.toFixed(18)),
        activeAddresses: activeAddr,
        inactiveAddresses: inactiveAddr,
      };
    }, [breakdown]);

  const maxVol = Math.max(activeVolume, inactiveVolume, 1);

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-start justify-between relative z-10 mb-4">
          <div>
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              Actively Delegating
            </h4>
          </div>
          <div className="p-2 bg-[#00E391]/10 rounded-lg border border-[#00E391]/20">
            <UserPlus className="w-4 h-4 text-[#00E391]" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-end justify-between border-b border-gray-50 pb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Volume (veNEAR)
            </span>
            <TooltipWithTap
              content={`${new Intl.NumberFormat("en", {
                maximumFractionDigits: 2,
              }).format(activeVolume)} NEAR`}
            >
              <span className="text-xl font-black text-gray-900 cursor-pointer">
                {formatVotingPower(activeVolume, maxVol)}
              </span>
            </TooltipWithTap>
          </div>
          <div className="flex items-end justify-between border-b border-gray-50 pb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Unique Addresses
            </span>
            <TooltipWithTap
              content={`${new Intl.NumberFormat("en").format(
                activeAddresses
              )} Addresses`}
            >
              <span className="text-xl font-black text-gray-900 cursor-pointer">
                {activeAddresses.toLocaleString()}
              </span>
            </TooltipWithTap>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-start justify-between relative z-10 mb-4">
          <div>
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              Not Actively Delegating
            </h4>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
            <UserCircle className="w-4 h-4 text-gray-500" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-end justify-between border-b border-gray-50 pb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Volume (veNEAR)
            </span>
            <TooltipWithTap
              content={`${new Intl.NumberFormat("en", {
                maximumFractionDigits: 2,
              }).format(inactiveVolume)} NEAR`}
            >
              <span className="text-xl font-black text-gray-900 cursor-pointer">
                {formatVotingPower(inactiveVolume, maxVol)}
              </span>
            </TooltipWithTap>
          </div>
          <div className="flex items-end justify-between border-b border-gray-50 pb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Unique Addresses
            </span>
            <TooltipWithTap
              content={`${new Intl.NumberFormat("en").format(
                inactiveAddresses
              )} Addresses`}
            >
              <span className="text-xl font-black text-gray-900 cursor-pointer">
                {inactiveAddresses.toLocaleString()}
              </span>
            </TooltipWithTap>
          </div>
        </div>
      </div>
    </div>
  );
};
