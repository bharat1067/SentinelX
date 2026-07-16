import React from "react";
import { cn } from "@/lib/utils";

interface StatWidgetProps {
  label: string;
  value: string | number;
  percentage?: number; // to draw progress bar below
  barColor?: string;
  className?: string;
}

export const StatWidget: React.FC<StatWidgetProps> = ({
  label,
  value,
  percentage,
  barColor = "bg-sky-500",
  className
}) => {
  return (
    <div className={cn("p-3 bg-[#090d16] border border-[#172033] rounded flex flex-col gap-1.5", className)}>
      <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
        {label}
      </span>
      <span className="text-xl font-bold font-mono text-slate-200">{value}</span>

      {percentage !== undefined && (
        <div className="w-full bg-[#172033] h-1 rounded overflow-hidden mt-1">
          <div
            className={cn("h-full rounded", barColor)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
};
