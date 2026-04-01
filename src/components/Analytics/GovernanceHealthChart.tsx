import React from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Activity } from "lucide-react";
import { TooltipWithTap } from "@/components/ui/tooltip-with-tap";
import { convertYoctoToNear, formatVotingPower } from "@/lib/utils";
export function GovernanceHealthChart({
  turnoutTrend,
}: {
  turnoutTrend: Array<{
    proposalId: string | number;
    uniqueVoters: string;
    totalTurnoutVp: string;
  }>;
}) {
  const chartData = (turnoutTrend || []).map((t) => ({
    name: `#${t.proposalId}`,
    voters: Number(t.uniqueVoters || 0),
    vp: parseFloat(convertYoctoToNear(t.totalTurnoutVp || "0")) || 0,
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden flex flex-col items-center justify-between group w-full">
      <div className="w-full border-b border-gray-100 pb-4 mb-4 flex items-start justify-between">
        <div>
          <h4 className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest relative z-10">
            Governance Pulse
          </h4>
          <p className="text-xs text-gray-400 mt-1">
            Turnout trend over historical proposals
          </p>
        </div>
        <TooltipWithTap
          content={
            <p className="max-w-xs text-xs font-medium text-center">
              Tracks unique voting addresses and aggregated voting power acting
              in past governance events.
            </p>
          }
          side="left"
        >
          <div className="cursor-pointer p-1">
            <Activity className="text-blue-500 w-5 h-5 hover:opacity-80 transition-opacity" />
          </div>
        </TooltipWithTap>
      </div>

      <div className="w-full h-72 relative z-10 overflow-x-auto overflow-y-hidden border-t sm:border-t-0 border-gray-100 mt-2 sm:mt-0">
        <div className="min-w-[450px] sm:min-w-0 h-full pb-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
              }}
            >
              <CartesianGrid
                stroke="#f5f5f5"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                dy={10}
              />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickFormatter={(value) => `${value}`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickFormatter={(value) => {
                  if (value === 0) return "0";
                  return formatVotingPower(value, value);
                }}
              />
              <Tooltip
                cursor={false}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white/95 backdrop-blur-md border border-gray-100 p-3 rounded-xl shadow-lg">
                        <p className="text-sm font-bold text-gray-800 mb-2">
                          {label}
                        </p>
                        {payload.map((entry, index) => (
                          <p
                            key={index}
                            className="text-[11px] font-medium mt-1 uppercase tracking-wide flex justify-between gap-4"
                            style={{ color: entry.color }}
                          >
                            <span>{entry.name}:</span>
                            <span className="font-bold text-gray-900">
                              {entry.dataKey === "vp"
                                ? entry.value === 0
                                  ? "0"
                                  : formatVotingPower(
                                      entry.value as number,
                                      entry.value as number
                                    )
                                : entry.value}
                            </span>
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "20px" }} />
              <Bar
                yAxisId="left"
                dataKey="voters"
                name="Unique Voters"
                barSize={20}
                fill="#00E391"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="vp"
                name="Total VP"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
