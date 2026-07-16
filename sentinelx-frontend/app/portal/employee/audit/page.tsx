"use client";

import React, { useEffect, useState } from "react";
import { useUserStore } from "@/stores/user.store";
import { useRouter } from "next/navigation";
import { EmployeeLayout } from "@/layouts/employee/EmployeeLayout";
import { WorkspaceHeader } from "@/components/common/WorkspaceHeader";
import { DashboardCard } from "@/components/common/DashboardCard";
import { SecurityDataTable } from "@/components/common/SecurityDataTable";
import { SearchBar } from "@/components/common/SearchBar";

interface LocalAuditLog {
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  status: "SUCCESS" | "DENIED";
  severity: "low" | "medium" | "high";
}

const MOCK_AUDITS: LocalAuditLog[] = [
  { timestamp: "14:02:10", user: "amit_verma", action: "DB_QUERY_SELECT", resource: "bom_ledger.system_metrics", status: "SUCCESS", severity: "low" },
  { timestamp: "14:00:00", user: "backup_daemon", action: "INTEGRITY_CHECK_RUN", resource: "bom_backup.postgres_ledgers", status: "SUCCESS", severity: "low" },
  { timestamp: "13:51:22", user: "rajesh_kumar", action: "BYPASS_REQUEST_APPROVE", resource: "bom_ledger.core_bypass_credentials", status: "SUCCESS", severity: "low" },
  { timestamp: "13:10:45", user: "amit_verma", action: "DB_PRIVILEGE_BYPASS", resource: "bom_ledger.core_bypass_credentials", status: "DENIED", severity: "medium" }
];

export default function AuditLogsPortal() {
  const router = useRouter();
  const { isAuthenticated, activePersona } = useUserStore();

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !activePersona || activePersona.role !== "Employee") {
      router.push("/");
    }
  }, [isAuthenticated, activePersona, router]);

  if (!isAuthenticated || !activePersona) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#07090f] text-slate-500 font-mono text-xs">
        Verifying security token clearance...
      </div>
    );
  }

  const filteredData = MOCK_AUDITS.filter((aud) =>
    aud.user.toLowerCase().includes(searchQuery.toLowerCase()) || aud.action.includes(searchQuery.toUpperCase())
  );

  const columns = [
    {
      header: "Timestamp",
      accessor: (a: LocalAuditLog) => <span className="font-mono text-slate-500">{a.timestamp}</span>,
    },
    {
      header: "System User",
      accessor: (a: LocalAuditLog) => <span className="font-semibold font-mono text-slate-300">{a.user}</span>,
    },
    {
      header: "Action Log Type",
      accessor: (a: LocalAuditLog) => <span className="font-mono text-slate-400">{a.action}</span>,
    },
    {
      header: "Target Resource Scope",
      accessor: (a: LocalAuditLog) => <span className="text-slate-400 font-mono text-[10px]">{a.resource}</span>,
    },
    {
      header: "Status",
      accessor: (a: LocalAuditLog) => (
        <span
          className={
            a.status === "SUCCESS"
              ? "text-emerald-500 bg-emerald-500/10 border border-emerald-900/30 px-1.5 py-0.25 rounded text-[10px]"
              : "text-red-500 bg-red-950/20 border border-red-900/30 px-1.5 py-0.25 rounded text-[10px]"
          }
        >
          {a.status}
        </span>
      ),
    },
    {
      header: "Severity",
      accessor: (a: LocalAuditLog) => (
        <span className={a.severity === "high" ? "text-red-400" : a.severity === "medium" ? "text-amber-500" : "text-slate-500"}>
          {a.severity.toUpperCase()}
        </span>
      ),
    },
  ];

  return (
    <EmployeeLayout>
      <WorkspaceHeader
        title="Local Operational Audits ledger"
        breadcrumbs={["Portal", "Audit Logs"]}
        status="OPERATIONAL"
        riskSummary={`${filteredData.length} records parsed`}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        <DashboardCard
          title="Operational Activities Database Logs"
          description="Local logs trace index"
          headerActions={
            <SearchBar
              placeholder="Search user or action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          }
        >
          <SecurityDataTable
            data={filteredData}
            columns={columns}
            keyExtractor={(a) => `${a.timestamp}-${a.action}`}
          />
        </DashboardCard>
      </div>
    </EmployeeLayout>
  );
}
