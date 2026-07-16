import React from "react";
import { SecurityDataTable, Column } from "./SecurityDataTable";
import { AuditRecord } from "@/components/security/AuditCard";
import { Button } from "@/components/ui/button";

interface AuditTableProps {
  records: AuditRecord[];
  onVerify?: (id: string) => void;
  className?: string;
}

export const AuditTable: React.FC<AuditTableProps> = ({ records, onVerify, className }) => {
  const columns: Column<AuditRecord>[] = [
    {
      header: "BLOCK ID",
      accessor: (r: AuditRecord) => <span className="text-slate-400 font-semibold">{r.id}</span>,
    },
    {
      header: "Timestamp",
      accessor: (r: AuditRecord) => <span>{r.timestamp}</span>,
    },
    {
      header: "Actor",
      accessor: (r: AuditRecord) => <span className="text-slate-300">{r.actor}</span>,
    },
    {
      header: "Action Type",
      accessor: (r: AuditRecord) => <span>{r.action}</span>,
    },
    {
      header: "Ledger Hash (SHA-256)",
      accessor: (r: AuditRecord) => (
        <span className="text-slate-500 font-mono text-[10px] block max-w-[150px] truncate" title={r.currentHash}>
          {r.currentHash}
        </span>
      ),
    },
    {
      header: "Verification",
      accessor: (r: AuditRecord) => (
        <span
          className={
            r.status === "verified"
              ? "text-emerald-500 font-semibold"
              : "text-red-500 font-bold"
          }
        >
          {r.status.toUpperCase()}
        </span>
      ),
    },
    {
      header: "Verify",
      accessor: (r: AuditRecord) => (
        <Button
          onClick={() => onVerify?.(r.id)}
          variant="outline"
          size="sm"
          className="h-6 border-[#1f2937] hover:bg-slate-800 text-[10px] px-2"
        >
          Verify Proof
        </Button>
      ),
      className: "text-right",
    },
  ];

  return (
    <SecurityDataTable
      data={records}
      columns={columns}
      keyExtractor={(r) => r.id}
      className={className}
    />
  );
};
