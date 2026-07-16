"use client";

import React, { useEffect, useState } from "react";
import { useUserStore } from "@/stores/user.store";
import { useRouter } from "next/navigation";
import { EmployeeLayout } from "@/layouts/employee/EmployeeLayout";
import { WorkspaceHeader } from "@/components/common/WorkspaceHeader";
import { DashboardCard } from "@/components/common/DashboardCard";
import { SecurityDataTable } from "@/components/common/SecurityDataTable";
import { SearchBar } from "@/components/common/SearchBar";

interface BranchRecord {
  code: string;
  name: string;
  location: string;
  vaultBalance: string;
  managerCode: string;
}

const MOCK_BRANCHES: BranchRecord[] = [
  { code: "BOM-PUNE-01", name: "Pune Corporate Head", location: "Pune, Maharashtra", vaultBalance: "₹45,200,000", managerCode: "MGR-PUNE-01" },
  { code: "BOM-MUM-02", name: "Mumbai Nariman Point", location: "Mumbai, Maharashtra", vaultBalance: "₹82,400,000", managerCode: "MGR-MUM-02" },
  { code: "BOM-DEL-03", name: "Connaught Place Hub", location: "New Delhi, Delhi", vaultBalance: "₹38,000,000", managerCode: "MGR-DEL-03" },
  { code: "BOM-BLR-04", name: "Bangalore MG Road", location: "Bangalore, Karnataka", vaultBalance: "₹29,500,000", managerCode: "MGR-BLR-04" }
];

export default function BranchesRegistry() {
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

  const filteredData = MOCK_BRANCHES.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.code.includes(searchQuery.toUpperCase())
  );

  const columns = [
    {
      header: "Branch Code",
      accessor: (b: BranchRecord) => <span className="font-semibold font-mono text-slate-400">{b.code}</span>,
    },
    {
      header: "Branch Name",
      accessor: (b: BranchRecord) => <span className="text-slate-200 font-semibold">{b.name}</span>,
    },
    {
      header: "Location",
      accessor: (b: BranchRecord) => <span>{b.location}</span>,
    },
    {
      header: "Vault Reserve Balance",
      accessor: (b: BranchRecord) => <span className="text-emerald-500 font-mono font-bold">{b.vaultBalance}</span>,
    },
    {
      header: "Manager Code",
      accessor: (b: BranchRecord) => <span className="text-slate-400 font-mono">{b.managerCode}</span>,
    },
  ];

  return (
    <EmployeeLayout>
      <WorkspaceHeader
        title="Corporate Branches Registry"
        breadcrumbs={["Portal", "Branches"]}
        status="OPERATIONAL"
        riskSummary={`${filteredData.length} active nodes`}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        <DashboardCard
          title="BOM Regional Branches Vault Ledger"
          description="Verify branch reserve allocations and management mappings"
          headerActions={
            <SearchBar
              placeholder="Search branch name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          }
        >
          <SecurityDataTable
            data={filteredData}
            columns={columns}
            keyExtractor={(b) => b.code}
          />
        </DashboardCard>
      </div>
    </EmployeeLayout>
  );
}
