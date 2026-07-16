import React from "react";
import { cn } from "@/lib/utils";
import { IconRegistry } from "@/constants/icons";
import { SeverityBadge } from "@/components/common/SeverityBadge";

export interface IncidentEvent {
  id: string;
  title: string;
  timestamp: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
}

interface IncidentTimelineProps {
  events: IncidentEvent[];
  className?: string;
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ events, className }) => {
  const TimelineIcon = IconRegistry.Timeline;

  return (
    <div className={cn("bg-[#0f1524] border border-[#1f2937] rounded p-4", className)}>
      <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-4 flex items-center gap-1.5">
        <TimelineIcon className="h-3.5 w-3.5" />
        Threat Activity Timeline
      </h3>

      {events.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-500 font-mono">No incidents recorded.</div>
      ) : (
        <div className="relative border-l border-[#1f2937] ml-2 pl-4 space-y-4">
          {events.map((event) => (
            <div key={event.id} className="relative flex gap-3 items-start group">
              {/* Timeline marker */}
              <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-[#1f2937] bg-[#0f1524] group-hover:border-slate-500 transition-colors" />

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-slate-200">{event.title}</span>
                  <span className="text-[10px] font-mono text-slate-500">{event.timestamp}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono px-1.5 py-0.25 bg-[#172033] text-slate-400 border border-[#1f2937] rounded">
                    {event.category}
                  </span>
                  <SeverityBadge severity={event.severity} />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-mono bg-[#090d16] p-2 border border-[#172033] rounded">
                  {event.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
