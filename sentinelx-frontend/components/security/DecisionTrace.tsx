import React from "react";
import { cn } from "@/lib/utils";
import { IconRegistry } from "@/constants/icons";

export interface TraceStep {
  name: string;
  status: "passed" | "failed" | "warning" | "pending";
  timestamp: string;
  details: string;
}

interface DecisionTraceProps {
  steps: TraceStep[];
  className?: string;
}

export const DecisionTrace: React.FC<DecisionTraceProps> = ({ steps, className }) => {
  const SuccessIcon = IconRegistry.Success;
  const ErrorIcon = IconRegistry.Error;
  const CriticalIcon = IconRegistry.Critical;

  return (
    <div className={cn("bg-[#0f1524] border border-[#1f2937] rounded p-4", className)}>
      <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-4 flex items-center gap-1.5">
        <IconRegistry.Identity className="h-3.5 w-3.5" />
        Policy Decision Trace Logs
      </h3>

      <div className="relative border-l border-[#1f2937] ml-2 pl-4 space-y-4">
        {steps.map((step, idx) => {
          let StatusIcon = null;

          if (step.status === "passed") {
            StatusIcon = <SuccessIcon className="h-4.5 w-4.5 text-[#10b981]" />;
          } else if (step.status === "failed") {
            StatusIcon = <ErrorIcon className="h-4.5 w-4.5 text-[#ef4444]" />;
          } else if (step.status === "warning") {
            StatusIcon = <CriticalIcon className="h-4.5 w-4.5 text-[#f59e0b]" />;
          } else {
            StatusIcon = <div className="h-4.5 w-4.5 rounded-full border border-slate-700 bg-slate-900" />;
          }

          return (
            <div key={idx} className="relative flex gap-3 items-start">
              {/* Timeline dot */}
              <div className="absolute -left-[25px] top-0.5 bg-[#0f1524] p-0.5 rounded-full">
                {StatusIcon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-200">{step.name}</span>
                  <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">{step.timestamp}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{step.details}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
