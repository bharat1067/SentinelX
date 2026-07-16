"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export interface ChartDataPoint {
  time: string;
  trustScore: number;
  riskScore: number;
}

interface TrustHistoryChartProps {
  data: ChartDataPoint[];
  className?: string;
}

export const TrustHistoryChart: React.FC<TrustHistoryChartProps> = ({ data, className }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className={cn("bg-[#0f1524] border border-[#1f2937] rounded p-4 h-[240px] flex items-center justify-center text-xs text-slate-500 font-mono", className)}>
        Loading telemetry chart...
      </div>
    );
  }

  return (
    <div className={cn("bg-[#0f1524] border border-[#1f2937] rounded p-4 flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Score Telemetry History
        </span>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Trust
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Risk
          </span>
        </div>
      </div>

      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <XAxis
              dataKey="time"
              stroke="#4b5563"
              fontSize={9}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#4b5563"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#090d16",
                borderColor: "#1f2937",
                fontSize: "10px",
                color: "#e2e8f0"
              }}
            />
            <Line
              type="monotone"
              dataKey="trustScore"
              stroke="#10b981"
              strokeWidth={1.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="riskScore"
              stroke="#ef4444"
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
