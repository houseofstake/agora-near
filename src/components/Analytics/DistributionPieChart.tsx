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
import { Box, Typography } from "@mui/material";

interface DistributionPieChartProps {
  data: any[];
  dataKey: string;
}

export const DistributionPieChart: React.FC<DistributionPieChartProps> = ({
  data,
  dataKey,
}) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((item) => ({
      name: item.isEndorsed ? "Endorsed Delegates" : "Standard Accounts",
      value: Number(BigInt(item[dataKey] || "0") / BigInt(1e24)),
      rawItems: item,
    }));
  }, [data, dataKey]);

  if (chartData.length === 0) {
    return (
      <Typography color="text.secondary">
        No governance data available yet.
      </Typography>
    );
  }

  const COLORS = ["#0b61cd", "#757575"]; // Bracarli Blue & Neutral Gray

  return (
    <Box sx={{ width: "100%", height: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            animationDuration={1500}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [
              `${value.toLocaleString()} veNEAR`,
              "Voting Power",
            ]}
            contentStyle={{
              borderRadius: 8,
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};
