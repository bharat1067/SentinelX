import React from "react";
import { cn } from "@/lib/utils";
import { IconRegistry } from "@/constants/icons";

interface TrustMeterProps {
  score: number; // 0 to 100
  className?: string;
}

export const TrustMeter: React.FC<TrustMeterProps> = ({ score, className }) => {
  // Determine color matching trust score (higher score = better trust)
  let statusColor = "text-[#10b981]"; // Green
  let barColor = "bg-[#10b981]";
  let label = "High Trust";

  if (score < 40) {
    statusColor = "text-[#ef4444]"; // Red
    barColor = "bg-[#ef4444]";
    label = "Zero Trust Violation";
  } else if (score < 75) {
    statusColor = "text-[#f59e0b]"; // Orange/Yellow
    barColor = "bg-[#f59e0b]";
    label = "Muted Trust";
  }

  const SecurityIcon = IconRegistry.Security;

  return (
    <div className={cn("p-4 bg-[#0f1524] border border-[#1f2937] rounded", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
          <SecurityIcon className="h-3.5 w-3.5 text-slate-400" />
          Trust Factor
        </span>
        <span className={cn("text-xs font-bold uppercase", statusColor)}>{label}</span>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-mono font-bold text-slate-100">{score}</span>
        <span className="text-xs text-slate-500 font-mono">/ 100</span>
      </div>

      {/* Segmented bar graph */}
      <div className="w-full bg-[#172033] h-2 rounded-full overflow-hidden flex gap-0.5">
        <div
          className={cn("h-full transition-all duration-300", barColor)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};
