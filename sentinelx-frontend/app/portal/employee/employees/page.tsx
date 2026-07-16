"use client";

import React, { useEffect, useState } from "react";
import { useUserStore } from "@/stores/user.store";
import { useRouter } from "next/navigation";
import { EmployeeLayout } from "@/layouts/employee/EmployeeLayout";
import { WorkspaceHeader } from "@/components/common/WorkspaceHeader";
import { DashboardCard } from "@/components/common/DashboardCard";
import { SecurityDataTable } from "@/components/common/SecurityDataTable";
import { SearchBar } from "@/components/common/SearchBar";

interface EmployeeStaffRecord {
  id: string;
  name: string;
  department: string;
  role: string;
  email: string;
}

const MOCK_STAFF: EmployeeStaffRecord[] = [
  { id: "EMP-101", name: "Amit Verma", department: "Core Database Operations", role: "Senior Database Administrator", email: "amit.verma@bom.co.in" },
  { id: "EMP-102", name: "Rajesh Kumar", department: "IT Governance & Risk", role: "IT Infrastructure Manager", email: "rajesh.kumar@bom.co.in" },
  { id: "EMP-103", name: "Neha Singh", department: "Security Operations", role: "Senior SOC Analyst", email: "neha.singh@bom.co.in" },
  { id: "EMP-104", name: "Kunal Kapoor", department: "Retail Banking Support", role: "Branch Supervisor", email: "kunal.kapoor@bom.co.in" }
];

export default function EmployeesRegistry() {
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

  const filteredData = MOCK_STAFF.filter((staff) =>
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()) || staff.id.includes(searchQuery.toUpperCase())
  );

  const columns = [
    {
      header: "Employee ID",
      accessor: (s: EmployeeStaffRecord) => <span className="font-semibold font-mono text-slate-400">{s.id}</span>,
    },
    {
      header: "Staff Name",
      accessor: (s: EmployeeStaffRecord) => <span className="text-slate-200 font-semibold">{s.name}</span>,
    },
    {
      header: "Department",
      accessor: (s: EmployeeStaffRecord) => <span>{s.department}</span>,
    },
    {
      header: "System Role",
      accessor: (s: EmployeeStaffRecord) => <span className="text-slate-300 font-mono">{s.role}</span>,
    },
    {
      header: "Corporate Email",
      accessor: (s: EmployeeStaffRecord) => <span className="text-slate-500 font-mono">{s.email}</span>,
    },
  ];

  return (
    <EmployeeLayout>
      <WorkspaceHeader
        title="Corporate Staff Registry"
        breadcrumbs={["Portal", "Employees"]}
        status="OPERATIONAL"
        riskSummary={`${filteredData.length} records verified`}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        <DashboardCard
          title="Staff Operations Directory"
          description="View active internal banking operations staff profiles"
          headerActions={
            <SearchBar
              placeholder="Search staff name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          }
        >
          <SecurityDataTable
            data={filteredData}
            columns={columns}
            keyExtractor={(s) => s.id}
          />
        </DashboardCard>
      </div>
    </EmployeeLayout>
  );
}
