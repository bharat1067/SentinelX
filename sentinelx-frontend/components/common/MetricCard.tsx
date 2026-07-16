import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: {
    direction: "up" | "down" | "neutral";
    label: string;
  };
  icon?: LucideIcon;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  trend,
  icon: Icon,
  className
}) => {
  return (
    <div className={cn("p-4 bg-[#0f1524] border border-[#1f2937] rounded flex items-center justify-between gap-4", className)}>
      <div className="space-y-1.5">
        <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase block">
          {title}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-slate-100">{value}</span>
          {subValue && <span className="text-xs text-slate-500 font-mono">{subValue}</span>}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[10px] font-mono">
            <span
              className={cn(
                trend.direction === "up"
                  ? "text-red-500"
                  : trend.direction === "down"
                  ? "text-emerald-500"
                  : "text-slate-500"
              )}
            >
              {trend.direction === "up" ? "▲" : trend.direction === "down" ? "▼" : "•"}
            </span>
            <span className="text-slate-400">{trend.label}</span>
          </div>
        )}
      </div>

      {Icon && (
        <div className="h-10 w-10 rounded border border-[#1f2937] bg-[#090d16] flex items-center justify-center text-slate-400">
          <Icon className="h-5 w-5" />
        </div>
      )}
    </div>
  );
};
