import React from "react";
import { cn } from "@/lib/utils";

export interface RiskFactor {
  name: string;
  score: number; // 0 to 100
  weight: number; // percentage
  status: "low" | "medium" | "high" | "critical";
}

interface RiskBreakdownCardProps {
  factors: RiskFactor[];
  className?: string;
}

export const RiskBreakdownCard: React.FC<RiskBreakdownCardProps> = ({ factors, className }) => {
  return (
    <div className={cn("p-4 bg-[#0f1524] border border-[#1f2937] rounded", className)}>
      <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-3">
        Multi-Factor Risk Analysis
      </h3>

      <div className="space-y-3">
        {factors.map((factor, idx) => {
          let scoreColor = "text-emerald-500";
          if (factor.score >= 80) {
            scoreColor = "text-red-500 font-bold";
          } else if (factor.score >= 40) {
            scoreColor = "text-amber-500";
          }

          return (
            <div key={idx} className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">{factor.name}</span>
                <span className="text-slate-500 text-[10px] font-mono">
                  Weight: {factor.weight}%
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#172033] h-1.5 rounded overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded",
                      factor.score >= 80 ? "bg-red-600" : factor.score >= 40 ? "bg-amber-500" : "bg-emerald-500"
                    )}
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
                <span className={cn("text-xs font-mono w-8 text-right shrink-0", scoreColor)}>
                  {factor.score}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
