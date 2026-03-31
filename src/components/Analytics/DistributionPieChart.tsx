"use client";

import React, { useMemo } from "react";
import Big from "big.js";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { convertYoctoToNear } from "@/lib/utils";

interface DistributionPieChartProps {
  data: { isEndorsed?: boolean; totalVotingPower?: string | number }[];
  dataKey?: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value, payload: dataPayload } = payload[0];

  return (
    <div className="bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl shadow-xl px-5 py-4 min-w-[190px] relative overflow-hidden">
      <div
        className="absolute left-0 top-0 w-1.5 h-full"
        style={{ backgroundColor: dataPayload.fill }}
      />
      <p className="text-[11px] text-gray-500 mb-1.5 font-bold uppercase tracking-widest">
        {name}
      </p>
      <p className="text-2xl font-black text-gray-900 tracking-tight">
        {new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(
          value
        )}
        <span className="text-xs font-semibold text-gray-400 ml-1.5 normal-case tracking-normal">
          veNEAR
        </span>
      </p>
    </div>
  );
};

const renderCustomLegend = (props: any) => {
  const { payload } = props;
  if (!payload || !Array.isArray(payload)) return null;

  return (
    <div className="flex flex-wrap justify-center gap-6 mt-6">
      {payload.map((entry: any, index: number) => (
        <div
          key={`item-${index}`}
          className="flex items-center gap-2.5 bg-gray-50 hover:bg-gray-100 transition-colors px-3 py-1.5 rounded-xl border border-gray-100"
        >
          <div
            className="w-3.5 h-3.5 rounded-full shadow-inner"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-bold text-gray-700">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export const DistributionPieChart: React.FC<DistributionPieChartProps> = ({
  data,
  dataKey = "totalVotingPower",
}) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const aggregated = data.reduce(
      (acc, curr) => {
        const isEndorsed = curr.isEndorsed === true;
        const key = isEndorsed ? "endorsed" : "standard";

        if (!acc[key]) {
          acc[key] = {
            name: isEndorsed ? "Endorsed Delegates" : "Standard Accounts",
            rawNear: Big(0),
          };
        }

        const raw = curr[dataKey as keyof typeof curr];
        const yoctoStr =
          raw === undefined || raw === null ? "" : String(raw).trim();
        const nearStr = convertYoctoToNear(yoctoStr);
        acc[key].rawNear = acc[key].rawNear.add(Big(nearStr || "0"));
        return acc;
      },
      {} as Record<string, { name: string; rawNear: Big }>
    );

    return Object.values(aggregated)
      .map((item) => ({
        name: item.name,
        value: Number(item.rawNear.toFixed(2)),
      }))
      .sort((a, b) => b.value - a.value);
  }, [data, dataKey]);

  if (chartData.length === 0) {
    return (
      <div className="flex h-full min-h-[360px] items-center justify-center rounded-2xl bg-gray-50/50 backdrop-blur-sm text-sm text-gray-500 border border-gray-100">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#00E391] animate-spin mb-4"></div>
          Analyzing governance distribution...
        </div>
      </div>
    );
  }

  const COLORS = ["#00E391", "#111827"];

  return (
    <div className="w-full min-h-[360px] flex flex-col items-center justify-center relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#00E391]/5 opacity-50 pointer-events-none rounded-2xl" />
      <ResponsiveContainer
        width="100%"
        height={420}
        className="focus:outline-none"
      >
        <PieChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          style={{ outline: "none" }}
        >
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={125}
            stroke="#ffffff"
            strokeWidth={4}
            paddingAngle={0}
            dataKey="value"
            animationDuration={1500}
            animationEasing="ease-out"
            style={{ outline: "none" }}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                className="hover:opacity-90 transition-opacity duration-300 drop-shadow-sm cursor-pointer focus:outline-none"
                style={{ outline: "none" }}
              />
            ))}
          </Pie>
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "transparent" }}
          />
          <Legend content={renderCustomLegend} verticalAlign="bottom" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
