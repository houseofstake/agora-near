"use client";

import React from "react";
import { Users, RefreshCcw, CheckCircle2, User } from "lucide-react";

interface DelegatorRelationshipsCardProps {
  data: any;
}

export const DelegatorRelationshipsCard: React.FC<
  DelegatorRelationshipsCardProps
> = ({ data }) => {
  if (!data)
    return (
      <div className="flex flex-col items-center justify-center p-8 text-sm text-gray-500 bg-gray-50/50 backdrop-blur-md rounded-2xl border border-gray-100 h-full">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-gray-200 mb-4"></div>
          Loading ecosystem relationships...
        </div>
      </div>
    );

  const endorsedReceiversObj = data.receivers?.find(
    (r: any) => r.isEndorsed
  ) || { delegatesWithMultiple: 0 };
  const standardReceiversObj = data.receivers?.find(
    (r: any) => !r.isEndorsed
  ) || { delegatesWithMultiple: 0 };

  const switches = Number(data.historicallySwitched || 0).toLocaleString();
  const multiEndorsed = Number(endorsedReceiversObj.delegatesWithMultiple);
  const multiStandard = Number(standardReceiversObj.delegatesWithMultiple);

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-start justify-between relative z-10">
          <div>
            <span className="block text-4xl font-black text-gray-900 tracking-tight mb-1">
              {switches}
            </span>
            <span className="text-sm font-bold text-gray-700">
              Delegators Reassinging Power
            </span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <RefreshCcw className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        <p className="text-xs font-medium text-gray-500 mt-4">
          Unique addresses that have historically switched their delegation to a
          different account.
        </p>
      </div>

      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden flex-1 flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
            <Users className="w-5 h-5 text-gray-600" />
          </div>
          <h4 className="text-sm font-bold text-gray-800">
            Multiple Supporters
          </h4>
        </div>

        <div className="flex items-center justify-between gap-2 mt-2 mb-4 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
          <div className="flex flex-col items-center flex-1">
            <div className="flex items-center gap-1.5 mb-1.5 opacity-80">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00E391]" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                Endorsed
              </span>
            </div>
            <span className="text-xl sm:text-2xl font-black text-gray-900">
              {multiEndorsed}
            </span>
          </div>

          <div className="w-px h-10 bg-gray-200 shrink-0"></div>

          <div className="flex flex-col items-center flex-1">
            <div className="flex items-center gap-1.5 mb-1.5 opacity-80">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                Regular
              </span>
            </div>
            <span className="text-xl sm:text-2xl font-black text-gray-900">
              {multiStandard}
            </span>
          </div>
        </div>

        <p className="text-[11px] font-medium text-gray-400 text-center">
          Compare delegates receiving voting power from 2 or more wallets.
        </p>
      </div>
    </div>
  );
};
