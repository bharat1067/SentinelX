"use client";

import React, { useEffect, useState } from "react";
import { useUserStore } from "@/stores/user.store";
import { useRouter } from "next/navigation";
import { EmployeeLayout } from "@/layouts/employee/EmployeeLayout";
import { WorkspaceHeader } from "@/components/common/WorkspaceHeader";
import { DashboardCard } from "@/components/common/DashboardCard";
import { SecurityDataTable } from "@/components/common/SecurityDataTable";
import { SearchBar } from "@/components/common/SearchBar";

interface LoanRecord {
  loanId: string;
  name: string;
  type: "HOME" | "CAR" | "COMMERCIAL";
  amount: string;
  rate: string;
  status: "ACTIVE" | "PENDING" | "DISBURSED";
}

const MOCK_LOANS: LoanRecord[] = [
  { loanId: "LON-801", name: "Siddharth Malhotra", type: "HOME", amount: "₹8,500,000", rate: "8.45%", status: "DISBURSED" },
  { loanId: "LON-802", name: "Ananya Pandey", type: "CAR", amount: "₹2,400,000", rate: "9.20%", status: "ACTIVE" },
  { loanId: "LON-803", name: "Dharma Productions", type: "COMMERCIAL", amount: "₹45,000,000", rate: "11.50%", status: "ACTIVE" },
  { loanId: "LON-804", name: "Amit Sharma", type: "HOME", amount: "₹4,200,000", rate: "8.75%", status: "PENDING" }
];

export default function LoansRegistry() {
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

  const filteredData = MOCK_LOANS.filter((loan) =>
    loan.name.toLowerCase().includes(searchQuery.toLowerCase()) || loan.loanId.includes(searchQuery)
  );

  const columns = [
    {
      header: "Loan Reference ID",
      accessor: (l: LoanRecord) => <span className="font-semibold text-slate-400">{l.loanId}</span>,
    },
    {
      header: "Debtor Client Name",
      accessor: (l: LoanRecord) => <span className="text-slate-200 font-semibold">{l.name}</span>,
    },
    {
      header: "Loan Category",
      accessor: (l: LoanRecord) => <span className="font-mono text-slate-400">{l.type}</span>,
    },
    {
      header: "Sanctioned Value",
      accessor: (l: LoanRecord) => <span className="text-slate-200 font-mono font-bold">{l.amount}</span>,
    },
    {
      header: "Interest Rate",
      accessor: (l: LoanRecord) => <span className="text-slate-500 font-mono">{l.rate}</span>,
    },
    {
      header: "Subsystem Status",
      accessor: (l: LoanRecord) => (
        <span
          className={
            l.status === "DISBURSED"
              ? "text-emerald-500 bg-emerald-500/10 border border-emerald-900/30 px-1.5 py-0.25 rounded text-[10px]"
              : l.status === "ACTIVE"
              ? "text-sky-500 bg-sky-500/10 border border-sky-900/30 px-1.5 py-0.25 rounded text-[10px]"
              : "text-amber-500 bg-amber-500/10 border border-amber-900/30 px-1.5 py-0.25 rounded text-[10px]"
          }
        >
          {l.status}
        </span>
      ),
    },
  ];

  return (
    <EmployeeLayout>
      <WorkspaceHeader
        title="Sanctioned Loans Operations Database"
        breadcrumbs={["Portal", "Loans"]}
        status="OPERATIONAL"
        riskSummary={`${filteredData.length} active files`}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        <DashboardCard
          title="Sanctioned Credit Profiles"
          description="Verify credit file allocations and status tracking"
          headerActions={
            <SearchBar
              placeholder="Search debtor or reference ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          }
        >
          <SecurityDataTable
            data={filteredData}
            columns={columns}
            keyExtractor={(l) => l.loanId}
          />
        </DashboardCard>
      </div>
    </EmployeeLayout>
  );
}
