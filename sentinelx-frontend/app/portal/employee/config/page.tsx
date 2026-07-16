"use client";

import React, { useEffect } from "react";
import { useUserStore } from "@/stores/user.store";
import { useRouter } from "next/navigation";
import { EmployeeLayout } from "@/layouts/employee/EmployeeLayout";
import { WorkspaceHeader } from "@/components/common/WorkspaceHeader";
import { DashboardCard } from "@/components/common/DashboardCard";
import { SecurityDataTable } from "@/components/common/SecurityDataTable";

interface ConfigRecord {
  key: string;
  value: string;
  description: string;
  modifiedBy: string;
}

const MOCK_CONFIGS: ConfigRecord[] = [
  { key: "DB_MAX_CONNECTIONS", value: "500", description: "Limits total simultaneous PostgreSQL sessions capacity", modifiedBy: "system_daemon" },
  { key: "VAULT_CREDENTIAL_TTL_MINS", value: "30", description: "Checkout session validity limits for admin keys", modifiedBy: "rajesh_kumar" },
  { key: "AUDIT_LOG_REPLAY_SINK", value: "Splunk_Gateway_Service", description: "Target address where system queries logs are replicated", modifiedBy: "system_daemon" }
];

export default function SystemConfiguration() {
  const router = useRouter();
  const { isAuthenticated, activePersona } = useUserStore();

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

  const columns = [
    {
      header: "Parameter Variable Key",
      accessor: (c: ConfigRecord) => <span className="font-semibold font-mono text-slate-400">{c.key}</span>,
    },
    {
      header: "Configuration Value",
      accessor: (c: ConfigRecord) => <span className="text-emerald-500 font-mono font-bold">{c.value}</span>,
    },
    {
      header: "Parameter Description",
      accessor: (c: ConfigRecord) => <span className="text-slate-400">{c.description}</span>,
    },
    {
      header: "Last Editor",
      accessor: (c: ConfigRecord) => <span className="text-slate-500 font-mono">{c.modifiedBy}</span>,
    },
  ];

  return (
    <EmployeeLayout>
      <WorkspaceHeader
        title="Infrastructure System Configuration Console"
        breadcrumbs={["Portal", "System Config"]}
        status="OPERATIONAL"
        riskSummary={`${MOCK_CONFIGS.length} parameter items`}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        <DashboardCard
          title="System Settings Registry"
          description="Operational limit parameters parameters"
        >
          <SecurityDataTable
            data={MOCK_CONFIGS}
            columns={columns}
            keyExtractor={(c) => c.key}
          />
        </DashboardCard>
      </div>
    </EmployeeLayout>
  );
}
