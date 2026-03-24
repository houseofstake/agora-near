"use client";

import React from "react";

interface DelegatorRelationshipsCardProps {
  data: any;
}

function MetricRow({
  value,
  label,
  sublabel,
}: {
  value: string | number;
  label: string;
  sublabel?: string;
}) {
  return (
    <div className="flex flex-col mb-6 last:mb-0">
      <div className="flex items-end gap-2 mb-1">
        <span className="text-3xl font-extrabold text-black">{value}</span>
      </div>
      <span className="text-sm font-semibold text-gray-800">{label}</span>
      {sublabel && (
        <span className="text-xs font-medium text-gray-500 mt-0.5">
          {sublabel}
        </span>
      )}
    </div>
  );
}

export const DelegatorRelationshipsCard: React.FC<
  DelegatorRelationshipsCardProps
> = ({ data }) => {
  if (!data)
    return (
      <div className="text-sm text-gray-500 bg-gray-50 p-6 rounded-xl border border-gray-100">
        Loading ecosystem relationships...
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
    <div className="flex flex-col justify-center h-full">
      <MetricRow
        value={switches}
        label="Delegators Reassigning Power"
        sublabel="Unique addresses that have historically switched their delegation to a different account."
      />

      <div className="w-full h-px bg-gray-200 my-4" />

      <MetricRow
        value={`${multiEndorsed} / ${multiStandard}`}
        label="Delegates with Multiple Supporters"
        sublabel="Endorsed vs Regular delegates receiving voting power from 2 or more wallets."
      />
    </div>
  );
};
