"use client";

import { useVenearTotalSupplyHistory } from "@/hooks/useVenearTotalSupplyHistory";
import {
  VenearSupplyHistoryRange,
  VenearTotalSupplyHistoryRecord,
} from "@/lib/api/venear/requests";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { convertYoctoToNear } from "@/lib/utils";
const RANGES: { value: VenearSupplyHistoryRange; label: string }[] = [
  { value: "1M", label: "1M" },
  { value: "3M", label: "3M" },
  { value: "6M", label: "6M" },
  { value: "1Y", label: "1Y" },
];

const CHART_COLOR = "#00E391";
const GRID_STROKE = "#e5e7eb";

type ChartDataPoint = {
  recordedAt: string;
  totalSupply: number;
};

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const { recordedAt, totalSupply } = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xl px-4 py-3 min-w-[160px]">
      <p className="text-xs text-gray-600 mb-1">
        {format(new Date(recordedAt), "MMM d, yyyy")}
      </p>
      <p className="text-base font-bold text-black">
        {new Intl.NumberFormat("en", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(totalSupply)}{" "}
        veNEAR
      </p>
    </div>
  );
}

function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toFixed(2);
}

function MetricRow({
  label,
  value,
  unit,
  valueClassName = "text-black",
  className = "",
}: {
  label: string;
  value: string;
  unit?: string;
  valueClassName?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-sm font-medium text-gray-600 mb-0.5">{label}</p>
      <p className={`text-2xl font-bold ${valueClassName}`}>{value}</p>
      {unit && <p className="text-sm text-gray-600 mt-0.5">{unit}</p>}
    </div>
  );
}

export function TotalVeNearSupplyChart() {
  const [range, setRange] = useState<VenearSupplyHistoryRange>("1Y");
  const { data, isLoading } = useVenearTotalSupplyHistory(range);

  const chartData = useMemo((): ChartDataPoint[] => {
    if (!data?.data?.length) return [];
    return data.data.map((h: VenearTotalSupplyHistoryRecord) => ({
      recordedAt: h.recorded_at,
      totalSupply: Number(convertYoctoToNear(h.total_supply)),
    }));
  }, [data]);

  const latestFormatted = useMemo(() => {
    if (!data?.latest) return "—";
    const num = convertYoctoToNear(data.latest);
    return new Intl.NumberFormat("en", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(num));
  }, [data?.latest]);

  const yDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 1];
    const values = chartData.map((d) => d.totalSupply);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1 || max * 0.1;
    return [Math.max(0, min - padding), max + padding];
  }, [chartData]);

  const xAxisTicks = useMemo(() => {
    if (chartData.length < 4) return chartData.map((d) => d.recordedAt);
    const step = (chartData.length - 1) / 3;
    return [0, 1, 2, 3].map((i) => chartData[Math.round(i * step)].recordedAt);
  }, [chartData]);

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="animate-pulse space-y-6">
          <div>
            <div className="h-7 w-56 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-72 bg-gray-100 rounded" />
          </div>
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-12">
            <div className="space-y-8 min-w-[180px]">
              <div className="h-16 bg-gray-100 rounded" />
              <div className="h-16 bg-gray-100 rounded" />
              <div className="h-16 bg-gray-100 rounded" />
            </div>
            <div className="flex-1 h-[280px] bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border-b border-gray-200 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-2xl font-extrabold text-black">
            Total veNEAR Supply
          </h3>
          <p className="text-base text-gray-600 mt-1">
            veNEAR outstanding across all locked positions
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`rounded-full px-4 py-2 text-sm transition-all ${
                range === r.value
                  ? "bg-[#00E391] text-black font-bold border-0"
                  : "bg-white border border-gray-200 text-gray-600 font-normal hover:bg-gray-50"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
        <div className="flex flex-col gap-8 min-w-[180px] lg:min-w-[200px] shrink-0">
          <MetricRow
            label="Total Locked"
            value={latestFormatted}
            unit="veNEAR"
            className="border-b border-gray-200 pb-4"
          />
          <MetricRow
            label="Participants"
            value={data?.participants_count?.toString() ?? "—"}
          />
        </div>

        <div className="flex-1 w-full min-w-0">
          {chartData.length > 0 ? (
            <div className="bg-white border-l border-gray-200 p-4 lg:p-6 pt-6 lg:pt-8">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 16, right: 16, left: 8, bottom: 8 }}
                >
                  <defs>
                    <linearGradient
                      id="venearSupplyGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={CHART_COLOR}
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="100%"
                        stopColor={CHART_COLOR}
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={GRID_STROKE}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="recordedAt"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => format(new Date(v), "MMM yyyy")}
                    tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 500 }}
                    ticks={xAxisTicks}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatYAxis}
                    tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 500 }}
                    width={52}
                    domain={yDomain}
                    tickCount={6}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{
                      stroke: "#d1d5db",
                      strokeWidth: 1,
                      strokeDasharray: "4 4",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalSupply"
                    stroke={CHART_COLOR}
                    strokeWidth={2.5}
                    fill="url(#venearSupplyGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
