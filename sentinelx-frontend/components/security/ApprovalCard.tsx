import React from "react";
import { cn } from "@/lib/utils";
import { IconRegistry } from "@/constants/icons";
import { Button } from "@/components/ui/button";

export interface ApprovalRequest {
  id: string;
  user: string;
  role: string;
  resource: string;
  durationMinutes: number;
  reason: string;
  riskScore: number;
  timestamp: string;
}

interface ApprovalCardProps {
  request: ApprovalRequest;
  onApprove?: (id: string) => void;
  onDeny?: (id: string) => void;
  className?: string;
}

export const ApprovalCard: React.FC<ApprovalCardProps> = ({
  request,
  onApprove,
  onDeny,
  className
}) => {
  const ShieldIcon = IconRegistry.Security;
  const ClockIcon = IconRegistry.Timeline;

  let riskColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  if (request.riskScore >= 70) {
    riskColor = "text-red-400 bg-red-950/20 border-red-900/30";
  } else if (request.riskScore >= 40) {
    riskColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";
  }

  return (
    <div className={cn("p-4 bg-[#0f1524] border border-[#1f2937] rounded flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-slate-200">{request.user}</span>
          <p className="text-[10px] text-slate-500 font-mono">{request.role}</p>
        </div>
        <span className={cn("text-[10px] font-mono px-2 py-0.5 border rounded", riskColor)}>
          Risk Score: {request.riskScore}
        </span>
      </div>

      <div className="space-y-1.5 bg-[#090d16] p-2.5 border border-[#172033] rounded text-[11px] font-mono text-slate-400">
        <div className="flex justify-between">
          <span className="text-slate-500">Resource:</span>
          <span className="text-slate-200 flex items-center gap-1">
            <ShieldIcon className="h-3 w-3" />
            {request.resource}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Duration:</span>
          <span className="text-slate-200 flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            {request.durationMinutes} minutes
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Requested:</span>
          <span className="text-slate-200">{request.timestamp}</span>
        </div>
        <div className="mt-1 border-t border-[#172033] pt-1">
          <span className="text-slate-500">Reason:</span>
          <p className="text-slate-300 mt-0.5 leading-normal">{request.reason}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-1">
        <Button
          onClick={() => onApprove?.(request.id)}
          size="sm"
          className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white border-0 text-[11px] h-7"
        >
          Approve Request
        </Button>
        <Button
          onClick={() => onDeny?.(request.id)}
          size="sm"
          variant="outline"
          className="flex-1 border-[#1f2937] hover:bg-slate-800 text-slate-300 text-[11px] h-7"
        >
          Deny Access
        </Button>
      </div>
    </div>
  );
};
