import React from "react";
import { cn } from "@/lib/utils";
import { SeverityBadge } from "@/components/common/SeverityBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { IconRegistry } from "@/constants/icons";

export interface SecurityEvent {
  id: string;
  title: string;
  source: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "resolved" | "suppressed";
  timestamp: string;
  user: string;
  ip: string;
  score: number;
}

interface SecurityEventCardProps {
  event: SecurityEvent;
  onSelect?: (id: string) => void;
  className?: string;
}

export const SecurityEventCard: React.FC<SecurityEventCardProps> = ({ event, onSelect, className }) => {
  const IdentityIcon = IconRegistry.Identity;

  return (
    <div
      onClick={() => onSelect?.(event.id)}
      className={cn(
        "p-3 bg-[#0f1524] border border-[#1f2937] hover:border-slate-500 rounded cursor-pointer transition-all flex flex-col gap-2.5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold text-slate-200 line-clamp-1">{event.title}</span>
        <span className="text-[10px] font-mono text-slate-500 shrink-0">{event.timestamp}</span>
      </div>

      <div className="flex items-center gap-2">
        <SeverityBadge severity={event.severity} />
        <StatusBadge status={event.status} />
        <span className="text-[10px] font-mono text-red-400 bg-red-950/20 border border-red-900/30 px-1.5 rounded ml-auto">
          Risk: {event.score}
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-[#172033] pt-2 mt-0.5">
        <span className="flex items-center gap-1">
          <IdentityIcon className="h-3 w-3" />
          {event.user}
        </span>
        <span className="text-slate-500">{event.ip}</span>
      </div>
    </div>
  );
};
