import React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, RefreshCw, AlertCircle } from "lucide-react";

interface WorkspaceHeaderProps {
  title: string;
  breadcrumbs: string[];
  status?: string;
  lastUpdated?: string;
  riskSummary?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  title,
  breadcrumbs,
  status = "OPERATIONAL",
  lastUpdated = "2026-07-15 14:04:35",
  riskSummary = "0 Critical Anomalies",
  actions,
  className
}) => {
  return (
    <div className={cn("border-b border-[#1f2937] bg-[#0c101d] p-4 flex flex-col gap-3 shrink-0", className)}>
      {/* Breadcrumb row */}
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
        <span>SentinelX</span>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span className={idx === breadcrumbs.length - 1 ? "text-slate-300" : ""}>
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Main row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 font-sans">
            {title}
          </h1>
          <div className="flex items-center gap-4 mt-1.5 text-[10px] font-mono text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              STATUS: <span className="text-emerald-500">{status}</span>
            </span>
            <span className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              UPDATED: <span className="text-slate-300">{lastUpdated}</span>
            </span>
            <span className="flex items-center gap-1 text-slate-400 bg-slate-900 border border-[#1f2937] px-1.5 py-0.25 rounded">
              <AlertCircle className="h-3 w-3 text-sky-400" />
              {riskSummary}
            </span>
          </div>
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
};
