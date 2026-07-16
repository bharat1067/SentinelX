import React from "react";
import { cn } from "@/lib/utils";
import { IconRegistry } from "@/constants/icons";

interface RiskMeterProps {
  score: number; // 0 to 100
  className?: string;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ score, className }) => {
  let colorClass = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  let barColor = "bg-emerald-500";
  let label = "Low Risk";

  if (score >= 90) {
    colorClass = "text-red-400 bg-red-950/30 border-red-900/50";
    barColor = "bg-red-800";
    label = "CRITICAL THREAT";
  } else if (score >= 70) {
    colorClass = "text-red-500 bg-red-950/10 border-red-950/20";
    barColor = "bg-red-500";
    label = "High Risk";
  } else if (score >= 40) {
    colorClass = "text-amber-500 bg-amber-500/10 border-amber-500/20";
    barColor = "bg-amber-500";
    label = "Medium Risk";
  }

  const CriticalIcon = IconRegistry.Critical;

  return (
    <div className={cn("p-4 bg-[#0f1524] border border-[#1f2937] rounded", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
          <CriticalIcon className="h-3.5 w-3.5 text-slate-400" />
          Threat Profile
        </span>
        <span className={cn("text-[10px] font-bold px-2 py-0.5 border rounded uppercase", colorClass)}>
          {label}
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-mono font-bold text-slate-100">{score}</span>
        <span className="text-xs text-slate-500 font-mono">/ 100</span>
      </div>

      <div className="w-full bg-[#172033] h-2 rounded overflow-hidden">
        <div
          className={cn("h-full transition-all duration-300", barColor)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};
