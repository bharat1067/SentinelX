import React from "react";
import { cn } from "@/lib/utils";
import { IconRegistry } from "@/constants/icons";

export interface DeviationMetric {
  featureName: string;
  baselineAvg: string;
  observedValue: string;
  sigmaDeviation: number; // e.g. 1.2, 3.5
  impactPercent: number; // risk contribution
}

interface BehaviourDeviationCardProps {
  metrics: DeviationMetric[];
  className?: string;
}

export const BehaviourDeviationCard: React.FC<BehaviourDeviationCardProps> = ({
  metrics,
  className
}) => {
  const BehaviorIcon = IconRegistry.Behaviour;

  return (
    <div className={cn("p-4 bg-[#0f1524] border border-[#1f2937] rounded", className)}>
      <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-3 flex items-center gap-1.5">
        <BehaviorIcon className="h-3.5 w-3.5" />
        UEBA Deviation Metrics
      </h3>

      <div className="space-y-3">
        {metrics.map((metric, idx) => {
          const isExtreme = metric.sigmaDeviation >= 3.0;
          const isWarning = metric.sigmaDeviation >= 2.0 && metric.sigmaDeviation < 3.0;

          let sigmaColor = "text-slate-400 bg-slate-900";
          if (isExtreme) {
            sigmaColor = "text-red-400 bg-red-950/20 border border-red-900/30";
          } else if (isWarning) {
            sigmaColor = "text-amber-500 bg-amber-500/10 border border-amber-500/20";
          }

          return (
            <div key={idx} className="border-b border-[#172033] last:border-0 pb-2 last:pb-0">
              <div className="flex items-center justify-between gap-3 text-xs mb-1">
                <span className="font-semibold text-slate-200">{metric.featureName}</span>
                <span className={cn("text-[9px] font-mono px-2 py-0.5 rounded", sigmaColor)}>
                  {metric.sigmaDeviation.toFixed(1)} σ Deviation
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500 mb-1.5">
                <div>Baseline Avg: <span className="text-slate-300">{metric.baselineAvg}</span></div>
                <div>Observed: <span className="text-slate-300">{metric.observedValue}</span></div>
              </div>

              {/* Progress bar to show impact contribution */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#172033] h-1 rounded overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded",
                      isExtreme ? "bg-red-600" : isWarning ? "bg-amber-500" : "bg-sky-500"
                    )}
                    style={{ width: `${metric.impactPercent}%` }}
                  />
                </div>
                <span className="text-[9px] font-mono text-slate-400 shrink-0">
                  Risk Contrib: {metric.impactPercent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
