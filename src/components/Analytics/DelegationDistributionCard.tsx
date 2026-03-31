"use client";

import React from "react";
import { UserPlus, UserCircle } from "lucide-react";

interface DelegationStat {
  isEndorsed: boolean;
  uniqueAddresses: string;
  totalDelegatedYocto: string;
}

interface DelegationDistributionCardProps {
  delegationData: DelegationStat[];
  selfDelegationData: DelegationStat[];
}

export const DelegationDistributionCard: React.FC<
  DelegationDistributionCardProps
> = ({ delegationData, selfDelegationData }) => {
  if (!delegationData || !selfDelegationData) {
    return (
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center p-8 text-sm text-gray-400 bg-gray-50/50 rounded-2xl border border-gray-100">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#00E391] animate-spin mb-4"></div>
          Analyzing distribution...
        </div>
      </div>
    );
  }

  // Parse total vs self delegation addresses
  const totalDelegatedAddresses = delegationData.reduce(
    (acc, curr) => acc + Number(curr.uniqueAddresses || 0),
    0
  );
  const totalSelfDelegatedAddresses = selfDelegationData.reduce(
    (acc, curr) => acc + Number(curr.uniqueAddresses || 0),
    0
  );

  // Parse total vs self delegated volume (Divide by 1e24 to format YoctoNEAR to NEAR)
  const totalDelegatedVolume = delegationData.reduce(
    (acc, curr) => acc + Number(curr.totalDelegatedYocto || 0) / 1e24,
    0
  );
  const totalSelfDelegatedVolume = selfDelegationData.reduce(
    (acc, curr) => acc + Number(curr.totalDelegatedYocto || 0) / 1e24,
    0
  );

  const formatVolume = (val: number) => {
    if (val >= 1e6) return (val / 1e6).toFixed(2) + "M";
    if (val >= 1e3) return (val / 1e3).toFixed(2) + "k";
    return val.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-start justify-between relative z-10 mb-4">
          <div>
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              Delegated to Others
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
            <span className="text-xl font-black text-gray-900">
              {formatVolume(totalDelegatedVolume)}
            </span>
          </div>
          <div className="flex items-end justify-between border-b border-gray-50 pb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Unique Addresses
            </span>
            <span className="text-xl font-black text-gray-900">
              {totalDelegatedAddresses.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-start justify-between relative z-10 mb-4">
          <div>
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              Self-Delegated
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
            <span className="text-xl font-black text-gray-900">
              {formatVolume(totalSelfDelegatedVolume)}
            </span>
          </div>
          <div className="flex items-end justify-between border-b border-gray-50 pb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Unique Addresses
            </span>
            <span className="text-xl font-black text-gray-900">
              {totalSelfDelegatedAddresses.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
