import React from "react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title?: string;
  description?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  headerActions,
  children,
  className
}) => {
  return (
    <div className={cn("bg-[#0f1524] border border-[#1f2937] rounded overflow-hidden flex flex-col", className)}>
      {(title || headerActions) && (
        <div className="border-b border-[#1f2937] px-4 py-3 flex items-center justify-between gap-3 shrink-0">
          <div>
            {title && <h3 className="text-xs font-semibold tracking-wider text-slate-300 uppercase">{title}</h3>}
            {description && <p className="text-[10px] text-slate-500 font-mono mt-0.5">{description}</p>}
          </div>
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </div>
      )}
      <div className="p-4 flex-1 min-h-0 overflow-y-auto no-scrollbar">
        {children}
      </div>
    </div>
  );
};
