import React from "react";
import { SecurityDataTable, Column } from "./SecurityDataTable";
import { SeverityBadge } from "./SeverityBadge";
import { StatusBadge } from "./StatusBadge";
import { SecurityAlert } from "@/stores/alert.store";

interface IncidentTableProps {
  alerts: SecurityAlert[];
  onSelect?: (alert: SecurityAlert) => void;
  className?: string;
}

export const IncidentTable: React.FC<IncidentTableProps> = ({ alerts, onSelect, className }) => {
  const columns: Column<SecurityAlert>[] = [
    {
      header: "ID",
      accessor: (a: SecurityAlert) => <span className="font-semibold text-slate-400">{a.id}</span>,
    },
    {
      header: "Alert Title",
      accessor: (a: SecurityAlert) => (
        <button
          onClick={() => onSelect?.(a)}
          className="text-left font-semibold text-slate-200 hover:text-sky-400 transition-colors"
        >
          {a.title}
        </button>
      ),
    },
    {
      header: "Source Node",
      accessor: (a: SecurityAlert) => <span>{a.source}</span>,
    },
    {
      header: "Severity",
      accessor: (a: SecurityAlert) => <SeverityBadge severity={a.severity} />,
    },
    {
      header: "Status",
      accessor: (a: SecurityAlert) => <StatusBadge status={a.status} />,
    },
    {
      header: "Target User",
      accessor: (a: SecurityAlert) => <span>{a.user}</span>,
    },
    {
      header: "IP",
      accessor: (a: SecurityAlert) => <span className="text-slate-500">{a.ip}</span>,
    },
  ];

  return (
    <SecurityDataTable
      data={alerts}
      columns={columns}
      keyExtractor={(a) => a.id}
      className={className}
    />
  );
};
