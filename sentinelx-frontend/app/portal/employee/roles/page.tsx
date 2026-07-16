"use client";

import React, { useEffect } from "react";
import { useUserStore } from "@/stores/user.store";
import { useRouter } from "next/navigation";
import { EmployeeLayout } from "@/layouts/employee/EmployeeLayout";
import { WorkspaceHeader } from "@/components/common/WorkspaceHeader";
import { DashboardCard } from "@/components/common/DashboardCard";
import { SecurityDataTable } from "@/components/common/SecurityDataTable";

interface RoleRecord {
  roleId: string;
  name: string;
  scope: string;
  permissionsCount: number;
}

const MOCK_ROLES: RoleRecord[] = [
  { roleId: "ROLE_DBA_SUPER", name: "Senior DBA Admin", scope: "Core database vacuum, backup controls, limits overrides", permissionsCount: 14 },
  { roleId: "ROLE_SOC_ANALYST", name: "Security Operations Analyst", scope: "Alert queues desk, policy tracking validation", permissionsCount: 8 },
  { roleId: "ROLE_IT_MANAGER", name: "IT Governance Manager", scope: "Bypass authorizations logs checks, credentials grants", permissionsCount: 10 }
];

export default function RoleManagement() {
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
      header: "Privilege ID Token",
      accessor: (r: RoleRecord) => <span className="font-semibold font-mono text-slate-400">{r.roleId}</span>,
    },
    {
      header: "Role Descriptor",
      accessor: (r: RoleRecord) => <span className="text-slate-200 font-semibold">{r.name}</span>,
    },
    {
      header: "Target Operational Scope",
      accessor: (r: RoleRecord) => <span className="text-slate-400">{r.scope}</span>,
    },
    {
      header: "Permissions Count",
      accessor: (r: RoleRecord) => <span className="text-slate-500 font-mono">{r.permissionsCount} rules</span>,
    },
  ];

  return (
    <EmployeeLayout>
      <WorkspaceHeader
        title="Access Roles & Credentials Roster"
        breadcrumbs={["Portal", "Role Management"]}
        status="OPERATIONAL"
        riskSummary={`${MOCK_ROLES.length} baseline roles`}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        <DashboardCard
          title="Role Registry Configurations"
          description="Baseline privilege permission maps"
        >
          <SecurityDataTable
            data={MOCK_ROLES}
            columns={columns}
            keyExtractor={(r) => r.roleId}
          />
        </DashboardCard>
      </div>
    </EmployeeLayout>
  );
}
