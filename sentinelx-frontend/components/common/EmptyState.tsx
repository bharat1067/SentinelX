import React from "react";
import { cn } from "@/lib/utils";
import { IconRegistry } from "@/constants/icons";

interface EmptyStateProps {
  title?: string;
  message?: string;
  iconName?: keyof typeof IconRegistry;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No Data Found",
  message = "No records align with the requested filter criteria.",
  iconName = "Monitoring",
  className
}) => {
  const Icon = IconRegistry[iconName];

  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center border border-[#1f2937] border-dashed rounded bg-[#0f1524]/30", className)}>
      <div className="h-12 w-12 rounded-full bg-[#172033] flex items-center justify-center text-slate-500 mb-3 border border-[#1f2937]">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-300">{title}</h3>
      <p className="text-xs text-slate-500 font-mono mt-1 max-w-[280px] leading-relaxed">
        {message}
      </p>
    </div>
  );
};
