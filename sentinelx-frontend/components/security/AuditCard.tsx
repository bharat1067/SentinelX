import React from "react";
import { cn } from "@/lib/utils";
import { IconRegistry } from "@/constants/icons";

export interface AuditRecord {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  currentHash: string;
  previousHash: string;
  status: "verified" | "compromised";
}

interface AuditCardProps {
  record: AuditRecord;
  className?: string;
}

export const AuditCard: React.FC<AuditCardProps> = ({ record, className }) => {
  const KeyIcon = IconRegistry.PrivilegedAccess;

  const isVerified = record.status === "verified";

  return (
    <div className={cn("p-3 bg-[#0f1524] border border-[#1f2937] rounded flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-200">{record.action}</span>
        <span
          className={cn(
            "text-[9px] font-mono font-bold px-1.5 py-0.25 border rounded uppercase",
            isVerified
              ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
              : "text-red-500 bg-red-500/10 border-red-500/20"
          )}
        >
          {record.status}
        </span>
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
        <span className="flex items-center gap-1">
          <KeyIcon className="h-3 w-3" />
          {record.actor}
        </span>
        <span>{record.timestamp}</span>
      </div>

      <div className="bg-[#090d16] p-2 border border-[#172033] rounded space-y-1 mt-1 font-mono text-[9px] text-slate-500">
        <div className="flex items-center justify-between gap-2">
          <span>CURR HASH:</span>
          <span className="text-slate-400 truncate max-w-[200px]" title={record.currentHash}>
            {record.currentHash}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span>PREV HASH:</span>
          <span className="text-slate-400 truncate max-w-[200px]" title={record.previousHash}>
            {record.previousHash}
          </span>
        </div>
      </div>
    </div>
  );
};
