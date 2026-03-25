"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

interface DistributionPieChartProps {
  data: any[];
  dataKey: string;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xl px-4 py-3 min-w-[160px]">
      <p className="text-xs text-gray-600 mb-1 font-medium">{name}</p>
      <p className="text-base font-extrabold text-black">
        {new Intl.NumberFormat("en").format(value)}
        <span className="text-xs font-normal text-gray-500 ml-1">veNEAR</span>
      </p>
    </div>
  );
}

const renderCustomLegend = (props: any) => {
  const { payload } = props;
  if (!payload || !Array.isArray(payload)) return null;

  return (
    <div className="flex flex-wrap justify-center gap-6 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-semibold text-gray-800">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export const DistributionPieChart: React.FC<DistributionPieChartProps> = ({
  data,
  dataKey,
}) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((item) => {
      const rawFloat = Number(item[dataKey] || 0);
      const nearValue = rawFloat / 1e24;

      return {
        name: item.isEndorsed ? "Endorsed Delegates" : "Standard Accounts",
        value: Number(nearValue.toFixed(2)),
        rawItems: item,
      };
    });
  }, [data, dataKey]);

  if (chartData.length === 0) {
    return (
      <div className="flex h-full min-h-[250px] items-center justify-center rounded-xl bg-gray-50 text-sm text-gray-500 border border-gray-100">
        No governance data available to chart.
      </div>
    );
  }

  const COLORS = ["#00E391", "#1F2937"]; // Agora Green & Tailwind Gray-800

  return (
    <div className="w-full min-h-[360px] flex flex-col items-center justify-center bg-white">
      <ResponsiveContainer width="100%" height={360}>
        <PieChart margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={65}
            outerRadius={100}
            stroke="none"
            paddingAngle={2}
            dataKey="value"
            animationDuration={1000}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
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
