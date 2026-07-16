"use client";

import React, { useEffect, useState } from "react";
import { useUserStore } from "@/stores/user.store";
import { useRouter } from "next/navigation";
import { EmployeeLayout } from "@/layouts/employee/EmployeeLayout";
import { WorkspaceHeader } from "@/components/common/WorkspaceHeader";
import { DashboardCard } from "@/components/common/DashboardCard";
import { SecurityDataTable } from "@/components/common/SecurityDataTable";
import { SearchBar } from "@/components/common/SearchBar";

interface UserRecord {
  username: string;
  name: string;
  role: string;
  status: "ACTIVE" | "INACTIVE";
  lastLogin: string;
}

const MOCK_USERS: UserRecord[] = [
  { username: "amit_verma", name: "Amit Verma", role: "DBA Admin", status: "ACTIVE", lastLogin: "14:02" },
  { username: "rajesh_kumar", name: "Rajesh Kumar", role: "IT Security Manager", status: "ACTIVE", lastLogin: "13:51" },
  { username: "neha_singh", name: "Neha Singh", role: "SOC Security Analyst", status: "ACTIVE", lastLogin: "12:04" },
  { username: "backup_daemon", name: "Backup Process Service", role: "System Service Daemon", status: "ACTIVE", lastLogin: "14:00" }
];

export default function UserManagement() {
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

  const filteredData = MOCK_USERS.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.username.includes(searchQuery)
  );

  const columns = [
    {
      header: "System Username",
      accessor: (u: UserRecord) => <span className="font-semibold font-mono text-slate-400">{u.username}</span>,
    },
    {
      header: "Real Name",
      accessor: (u: UserRecord) => <span className="text-slate-200 font-semibold">{u.name}</span>,
    },
    {
      header: "System Privilege Role",
      accessor: (u: UserRecord) => <span className="text-slate-400 font-mono">{u.role}</span>,
    },
    {
      header: "Account Standing",
      accessor: (u: UserRecord) => (
        <span
          className={
            u.status === "ACTIVE"
              ? "text-emerald-500 bg-emerald-500/10 border border-emerald-900/30 px-1.5 py-0.25 rounded text-[10px]"
              : "text-slate-500 bg-slate-900 border border-[#1f2937] px-1.5 py-0.25 rounded text-[10px]"
          }
        >
          {u.status}
        </span>
      ),
    },
    {
      header: "Last Activity Time",
      accessor: (u: UserRecord) => <span className="text-slate-500 font-mono">{u.lastLogin}</span>,
    },
  ];

  return (
    <EmployeeLayout>
      <WorkspaceHeader
        title="Privileged Access Account Desk"
        breadcrumbs={["Portal", "User Management"]}
        status="OPERATIONAL"
        riskSummary={`${filteredData.length} active administrators`}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        <DashboardCard
          title="Security Console Operators Directory"
          description="View active privilege system credentials"
          headerActions={
            <SearchBar
              placeholder="Search user profile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          }
        >
          <SecurityDataTable
            data={filteredData}
            columns={columns}
            keyExtractor={(u) => u.username}
          />
        </DashboardCard>
      </div>
    </EmployeeLayout>
  );
}
