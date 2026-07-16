import React from "react";
import { cn } from "@/lib/utils";

export interface SeverityBadgeProps {
  severity: "low" | "medium" | "high" | "critical";
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className }) => {
  let styleClass = "";
  let label = "";

  switch (severity) {
    case "low":
      styleClass = "severity-green";
      label = "Low";
      break;
    case "medium":
      styleClass = "severity-yellow";
      label = "Medium";
      break;
    case "high":
      styleClass = "severity-orange";
      label = "High";
      break;
    case "critical":
      styleClass = "severity-critical font-bold";
      label = "Critical";
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
