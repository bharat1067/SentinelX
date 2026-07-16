import React from "react";
import { SecurityDataTable, Column } from "./SecurityDataTable";
import { ApprovalRequest } from "@/components/security/ApprovalCard";
import { Button } from "@/components/ui/button";

interface ApprovalTableProps {
  requests: ApprovalRequest[];
  onApprove?: (id: string) => void;
  onDeny?: (id: string) => void;
  showActions?: boolean;
  className?: string;
}

export const ApprovalTable: React.FC<ApprovalTableProps> = ({
  requests,
  onApprove,
  onDeny,
  showActions = true,
  className
}) => {
  const columns: Column<ApprovalRequest>[] = [
    {
      header: "REQ ID",
      accessor: (r: ApprovalRequest) => <span className="font-semibold text-slate-400">{r.id}</span>,
    },
    {
      header: "Requesting User",
      accessor: (r: ApprovalRequest) => (
        <div>
          <span className="text-slate-200 block">{r.user}</span>
          <span className="text-[9px] text-slate-500">{r.role}</span>
        </div>
      ),
    },
    {
      header: "Resource Path",
      accessor: (r: ApprovalRequest) => <span>{r.resource}</span>,
    },
    {
      header: "Duration",
      accessor: (r: ApprovalRequest) => <span>{r.durationMinutes}m</span>,
    },
    {
      header: "Request Reason",
      accessor: (r: ApprovalRequest) => <span className="text-slate-400 max-w-[200px] truncate block" title={r.reason}>{r.reason}</span>,
    },
    {
      header: "Risk Factor",
      accessor: (r: ApprovalRequest) => {
        const isDangerous = r.riskScore >= 70;
        return (
          <span className={isDangerous ? "text-red-400 font-bold" : "text-emerald-500"}>
            {r.riskScore}%
          </span>
        );
      },
    },
  ];

  if (showActions) {
    columns.push({
      header: "Actions",
      accessor: (r: ApprovalRequest) => (
        <div className="flex items-center gap-1.5 justify-end">
          <Button
            onClick={() => onApprove?.(r.id)}
            size="sm"
            className="h-6 bg-emerald-700 hover:bg-emerald-600 text-white border-0 text-[10px] px-2"
          >
            Approve
          </Button>
          <Button
            onClick={() => onDeny?.(r.id)}
            variant="outline"
            size="sm"
            className="h-6 border-[#1f2937] hover:bg-slate-800 text-slate-300 text-[10px] px-2"
          >
            Deny
          </Button>
        </div>
      ),
      className: "text-right",
    });
  }

  return (
    <SecurityDataTable
      data={requests}
      columns={columns}
      keyExtractor={(r) => r.id}
      className={className}
    />
  );
};
