"use client";

import { ChartSkeleton } from "@/components/Proposals/ProposalPage/ProposalChart/ProposalChart";
import { ProposalVotingHistoryRecord } from "@/lib/api/proposal/types";
import { rgbStringToHex } from "@/lib/color";
import { ProposalInfo } from "@/lib/contracts/types/voting";
import { formatNearTime } from "@/lib/proposalUtils";
import Tenant from "@/lib/tenant/tenant";
import {
  formatFullDate,
  formatNumber,
  formatNumberWithScientificNotation,
  isScientificNotation,
} from "@/lib/utils";
import Big from "big.js";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const { token, ui } = Tenant.current();

interface Props {
  proposal: ProposalInfo;
  votes: ProposalVotingHistoryRecord[];
}

type ChartData = {
  timestamp: Date | null;
  for: number;
  against: number;
  abstain: number;
  total: number;
};

export const TimelineChart = ({ votes, proposal }: Props) => {
  const [chartData, setChartData] = useState<ChartData[] | null>(null);

  const startTime = formatNearTime(proposal.voting_start_time_ns);
  const endTime = formatNearTime(
    (
      Number(proposal.voting_start_time_ns) +
      Number(proposal.voting_duration_ns)
    ).toString()
  );
  const quorumAmount = Big(proposal.quorumAmount ?? "0");

  const stackIds: { [key: string]: string } = {
    for: "1",
    abstain: "2",
    against: "1",
  };

  useEffect(() => {
    if (!chartData) {
      const transformedData = transformVotesToChartData({
        votes: votes,
      });

      setChartData([
        {
          timestamp: startTime ? new Date(startTime) : null,
          for: 0,
          against: 0,
          abstain: 0,
          total: 0,
        },
        ...transformedData,
        {
          timestamp: endTime ? new Date(endTime) : null,
          for: transformedData[transformedData.length - 1]?.for,
          abstain: transformedData[transformedData.length - 1]?.abstain,
          against: transformedData[transformedData.length - 1]?.against,
          total: transformedData[transformedData.length - 1]?.total,
        },
      ]);
    }
  }, [chartData, votes, startTime, endTime]);

  if (!chartData) return <ChartSkeleton />;

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={230}>
        <AreaChart data={chartData}>
          <CartesianGrid
            vertical={false}
            strokeDasharray={"3 3"}
            stroke={rgbStringToHex(ui.customization?.tertiary)}
          />
          <XAxis
            dataKey="timestamp"
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            ticks={[startTime || "", endTime || ""]}
            tickFormatter={tickFormatter}
            tick={customizedXTick}
            className="text-xs font-inter font-semibold text-primary/30"
            fill={rgbStringToHex(ui.customization?.tertiary)}
          />

          <YAxis
            className="text-xs font-inter font-semibold fill:text-primary/30 fill"
            tick={{
              fill: rgbStringToHex(ui.customization?.tertiary),
            }}
            tickFormatter={yTickFormatter}
            tickLine={false}
            axisLine={false}
            tickCount={6}
            interval={0}
            width={54}
            tickMargin={4}
            domain={[
              0,
              (dataMax: number) => {
                // Add 10% padding above the higher value between dataMax and quorum
                return Math.max(dataMax, quorumAmount.toNumber()) * 1.1;
              },
            ]}
          />
          {!!quorumAmount && (
            <ReferenceLine
              y={quorumAmount.toString()}
              strokeWidth={1}
              strokeDasharray="3 3"
              stroke="#4F4F4F"
              label={{
                position: "insideBottomLeft",
                value: "QUORUM",
                className: "text-xs font-inter font-semibold",
                fill: "#565656",
              }}
            />
          )}

          <Tooltip
            content={<CustomTooltip quorum={quorumAmount.toFixed(0)} />}
            cursor={{ stroke: "#666", strokeWidth: 1, strokeDasharray: "4 4" }}
          />
          <Area
            type="step"
            dataKey="against"
            stackId={stackIds.against}
            stroke={rgbStringToHex(ui.customization?.negative)}
            fill={rgbStringToHex(ui.customization?.negative)}
            name="Against"
          />
          <Area
            type="step"
            dataKey="abstain"
            stackId={stackIds.abstain}
            stroke={rgbStringToHex(ui.customization?.secondary)}
            fill={rgbStringToHex(ui.customization?.secondary)}
            name="Abstain"
          />
          <Area
            type="step"
            dataKey="for"
            stackId={stackIds.for}
            stroke={rgbStringToHex(ui.customization?.positive)}
            fill={rgbStringToHex(ui.customization?.positive)}
            name="For"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Transforms an array of votes into chart data.
 */
const transformVotesToChartData = ({
  votes,
}: {
  votes: ProposalVotingHistoryRecord[];
}) => {
  let forCount = 0;
  let abstain = 0;
  let against = 0;

  return votes.map((vote) => {
    forCount =
      vote.voteOption === "0" ? forCount + Number(vote.votingPower) : forCount;
    abstain =
      vote.voteOption === "2" ? abstain + Number(vote.votingPower) : abstain;
    against =
      vote.voteOption === "1" ? against + Number(vote.votingPower) : against;

    return {
      weight: Number(vote.votingPower),
      for: forCount,
      abstain: abstain,
      against: against,
      timestamp: new Date(vote.votedAt),
      total: forCount + abstain + against,
    };
  });
};

const tickFormatter = (timeStr: string, index: number) => {
  const date = new Date(timeStr);
  const formattedDate = format(date, "yyyy-MM-dd h:mm a");

  const metaText = index === 0 ? "(vote begins)" : "(vote end)";
  return `${formattedDate} ${metaText}`;
};

const yTickFormatter = (value: any) => {
  const roundedValue = Math.round(value);
  const isSciNotation = isScientificNotation(roundedValue.toString());

  return formatNumber(
    isSciNotation
      ? formatNumberWithScientificNotation(roundedValue)
      : BigInt(roundedValue),
    token.decimals,
    roundedValue > 1_000_000 ? 2 : 4
  );
};

const customizedXTick = (props: any) => {
  const { index, x, y, payload, tickFormatter, className } = props;
  return (
    <g transform={`translate(${index === 0 ? x : x + 15},${y})`}>
      <text x={0} y={0} dy={10} fill="#AFAFAF" className={className}>
        <tspan textAnchor={"middle"} x="0">
          {tickFormatter(payload.value, index)}
        </tspan>
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload, label, quorum }: any) => {
  const forVotes = payload.find((p: any) => p.name === "For");
  const againstVotes = payload.find((p: any) => p.name === "Against");
  const voteOrder = ["For", "Against", "Abstain"];

  if (active && payload && payload.length) {
    const sortedPayload = [...payload].sort(
      (a, b) => voteOrder.indexOf(a.name) - voteOrder.indexOf(b.name)
    );

    const abstainVotes = payload.find((p: any) => p.name === "Abstain");

    const quorumVotes =
      BigInt(forVotes.value) +
      BigInt(againstVotes.value) +
      BigInt(abstainVotes.value);

    return (
      <div className="bg-neutral p-3 border border-line rounded-lg shadow-newDefault">
        {label && (
          <p className="text-xs font-semibold mb-2 text-primary">
            {formatFullDate(new Date(label))}
          </p>
        )}
        {sortedPayload.map((entry: any) => (
          <div
            key={entry.name}
            className="flex justify-between items-center gap-4 text-xs"
          >
            <span style={{ color: entry.color }}>
              {entry.name.charAt(0).toUpperCase() + entry.name.slice(1)}:
            </span>
            <span className="font-mono text-primary">
              {formatNumber(
                BigInt(entry.value),
                token.decimals,
                entry.value > 1_000_000 ? 2 : 4
              )}
            </span>
          </div>
        ))}
        {!!quorum && (
          <div className="flex justify-between items-center gap-4 text-xs pt-2 border-t border-line border-dashed mt-2">
            <span className="text-secondary">Quorum:</span>
            <div className="flex items-center gap-1">
              <span
                className={`font-mono ${
                  quorumVotes > quorum ? "text-primary" : "text-tertiary"
                }`}
              >
                {formatNumber(
                  BigInt(quorumVotes),
                  token.decimals,
                  quorumVotes > 1_000_000 ? 2 : 4
                )}
              </span>
              <span className="text-primary">/</span>
              <span className="font-mono text-primary">
                {formatNumber(
                  BigInt(quorum),
                  token.decimals,
                  quorum > 1_000_000 ? 2 : 4
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};
