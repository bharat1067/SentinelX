import React from "react";
import { cn } from "@/lib/utils";
import { IconRegistry } from "@/constants/icons";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Connection Interrupted",
  message = "Failed to establish real-time socket ingestion loop with core telemetry.",
  onRetry,
  className
}) => {
  const CriticalIcon = IconRegistry.Critical;

  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center border border-red-950/30 rounded bg-red-950/5", className)}>
      <div className="h-12 w-12 rounded-full bg-red-950/20 border border-red-900/30 flex items-center justify-center text-red-500 mb-3 animate-pulse">
        <CriticalIcon className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold text-red-400">{title}</h3>
      <p className="text-xs text-slate-400 font-mono mt-1 max-w-[320px] leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="mt-4 border-[#1f2937] hover:bg-slate-800 text-slate-300 text-[11px] h-7"
        >
          Retry Connection
        </Button>
      )}
    </div>
  );
};
