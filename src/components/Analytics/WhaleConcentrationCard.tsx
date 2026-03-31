import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ShieldAlert } from "lucide-react";
import { TooltipWithTap } from "@/components/ui/tooltip-with-tap";
export function WhaleConcentrationCard({
  whaleRisk,
}: {
  whaleRisk: {
    top10Power: string;
    restPower: string;
    top10Addresses: string;
    restAddresses: string;
  };
}) {
  const top10PowerNear = parseFloat(whaleRisk?.top10Power || "0") / 1e24 || 0;
  const restPowerNear = parseFloat(whaleRisk?.restPower || "0") / 1e24 || 0;

  const data = [
    {
      name: "Top 10 Wallets",
      value: top10PowerNear,
      color: "#FF4D4F", // Red warning hue
    },
    {
      name: "Rest of Ecosystem",
      value: restPowerNear,
      color: "#00E391", // Agora green
    },
  ];

  const totalPower = top10PowerNear + restPowerNear;
  const whalePercent = totalPower > 0 ? (top10PowerNear / totalPower) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden flex flex-col items-center justify-between group h-full">
      <div className="w-full p-5 sm:p-6 border-b border-gray-100 flex items-start justify-between">
        <div>
          <h4 className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest relative z-10">
            Whale Concentration
          </h4>
          <p className="text-xs text-gray-400 mt-1">
            Top 10 vs Retail Centralization
          </p>
        </div>
        <TooltipWithTap
          content={
            <p className="max-w-xs text-xs font-medium text-center">
              Compares the combined voting power of the top 10 accounts against
              the rest of the ecosystem.
            </p>
          }
          side="left"
        >
          <div className="cursor-pointer p-1">
            <ShieldAlert
              className={
                whalePercent > 50
                  ? "text-red-500 w-5 h-5 hover:opacity-80 transition-opacity"
                  : "text-green-500 w-5 h-5 hover:opacity-80 transition-opacity"
              }
            />
          </div>
        </TooltipWithTap>
      </div>

      <div className="w-full h-48 md:h-56 relative z-10 flex items-center justify-center -mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  className="transition-all duration-300 hover:opacity-80 drop-shadow-sm"
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white/95 backdrop-blur-md border border-gray-100 p-3 rounded-xl shadow-lg">
                      <p className="text-sm font-bold text-gray-800">
                        {payload[0].name}
                      </p>
                      <p className="text-[11px] font-medium text-gray-500 mt-1 uppercase tracking-wide">
                        {payload[0].value === 0
                          ? "0"
                          : (payload[0].value as number) >= 1_000_000
                            ? `${((payload[0].value as number) / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 1 })}M`
                            : (payload[0].value as number) >= 1_000
                              ? `${((payload[0].value as number) / 1_000).toLocaleString("en-US", { maximumFractionDigits: 1 })}k`
                              : (payload[0].value as number).toLocaleString(
                                  "en-US",
                                  { maximumFractionDigits: 0 }
                                )}{" "}
                        veNEAR
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={30}
              content={({ payload }) => (
                <ul className="flex justify-center gap-4 text-xs font-medium text-gray-500">
                  {payload?.map((entry, index) => (
                    <li
                      key={`item-${index}`}
                      className="flex items-center gap-1.5"
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      {entry.value === 0
                        ? "0"
                        : (entry.value as number) >= 1_000_000
                          ? `${((entry.value as number) / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 1 })}M`
                          : (entry.value as number) >= 1_000
                            ? `${((entry.value as number) / 1_000).toLocaleString("en-US", { maximumFractionDigits: 1 })}k`
                            : (entry.value as number).toLocaleString("en-US", {
                                maximumFractionDigits: 0,
                              })}
                    </li>
                  ))}
                </ul>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full p-4 sm:p-5 mt-auto border-t border-gray-50 bg-[#F8FDFB]/50">
        <div className="flex justify-between items-center text-sm font-semibold text-gray-800">
          <span>Top 10 Risk Factor</span>
          <span
            className={whalePercent > 50 ? "text-[#FF4D4F]" : "text-[#00E391]"}
          >
            {whalePercent.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
