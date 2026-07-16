import React from "react";
import { cn } from "@/lib/utils";

export interface StatusBadgeProps {
  status: "open" | "investigating" | "resolved" | "suppressed";
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  let styleClass = "";
  let label = "";

  switch (status) {
    case "open":
      styleClass = "text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20";
      label = "Active / Open";
      break;
    case "investigating":
      styleClass = "text-sky-500 bg-sky-500/10 border-sky-500/20";
      label = "Investigating";
      break;
    case "resolved":
      styleClass = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      label = "Resolved";
      break;
    case "suppressed":
      styleClass = "text-slate-500 bg-slate-500/10 border-slate-500/20";
      label = "Suppressed";
      break;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] font-mono px-2 py-0.5 border rounded uppercase",
        styleClass,
        className
      )}
    >
      {label}
    </span>
  );
};
