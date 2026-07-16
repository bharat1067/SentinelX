"use client";

import React, { useEffect, useState } from "react";
import { useUserStore } from "@/stores/user.store";
import { useRouter } from "next/navigation";
import { EmployeeLayout } from "@/layouts/employee/EmployeeLayout";
import { WorkspaceHeader } from "@/components/common/WorkspaceHeader";
import { DashboardCard } from "@/components/common/DashboardCard";
import { SecurityDataTable } from "@/components/common/SecurityDataTable";
import { SearchBar } from "@/components/common/SearchBar";
import { FilterBar } from "@/components/common/FilterBar";

interface AccountRecord {
  accountNumber: string;
  name: string;
  type: "SAVINGS" | "CURRENT" | "OVERDRAFT";
  balance: string;
  status: "ACTIVE" | "FROZEN" | "DORMANT";
}

const MOCK_ACCOUNTS: AccountRecord[] = [
  { accountNumber: "10091876543", name: "Karan Johar", type: "CURRENT", balance: "₹1,245,600", status: "ACTIVE" },
  { accountNumber: "10091876123", name: "Ananya Pandey", type: "SAVINGS", balance: "₹840,300", status: "ACTIVE" },
  { accountNumber: "10091876356", name: "Sunil Shetty", type: "CURRENT", balance: "₹2,150,000", status: "ACTIVE" },
  { accountNumber: "10091876400", name: "Amit Sharma", type: "SAVINGS", balance: "₹145,200", status: "ACTIVE" },
  { accountNumber: "10091876918", name: "Rahul Dev", type: "CURRENT", balance: "₹0.00", status: "FROZEN" },
  { accountNumber: "10091876002", name: "Sanjay Dutt", type: "SAVINGS", balance: "₹12,400", status: "DORMANT" }
];

export default function AccountsRegistry() {
  const router = useRouter();
  const { isAuthenticated, activePersona } = useUserStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

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

  const filteredData = MOCK_ACCOUNTS.filter((acc) => {
    const matchesSearch = acc.name.toLowerCase().includes(searchQuery.toLowerCase()) || acc.accountNumber.includes(searchQuery);
    const matchesFilter = filterStatus === "ALL" || acc.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const columns = [
    {
      header: "Account Number",
      accessor: (a: AccountRecord) => <span className="font-semibold font-mono text-slate-400">{a.accountNumber}</span>,
    },
    {
      header: "Account Holder",
      accessor: (a: AccountRecord) => <span className="text-slate-200 font-semibold">{a.name}</span>,
    },
    {
      header: "Account Type",
      accessor: (a: AccountRecord) => <span className="text-slate-400 font-mono">{a.type}</span>,
    },
    {
      header: "Ledger Balance",
      accessor: (a: AccountRecord) => <span className="text-emerald-500 font-mono font-bold">{a.balance}</span>,
    },
    {
      header: "Account Status",
      accessor: (a: AccountRecord) => (
        <span
          className={
            a.status === "ACTIVE"
              ? "text-emerald-500 bg-emerald-500/10 border border-emerald-900/30 px-1.5 py-0.25 rounded text-[10px]"
              : a.status === "FROZEN"
              ? "text-red-500 bg-red-950/20 border border-red-900/30 px-1.5 py-0.25 rounded text-[10px]"
              : "text-slate-500 bg-slate-900 border border-[#1f2937] px-1.5 py-0.25 rounded text-[10px]"
          }
        >
          {a.status}
        </span>
      ),
    },
  ];

  return (
    <EmployeeLayout>
      <WorkspaceHeader
        title="Core Banking Ledger Accounts"
        breadcrumbs={["Portal", "Accounts"]}
        status="OPERATIONAL"
        riskSummary={`${filteredData.length} Accounts Loaded`}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        <DashboardCard
          title="Account Registry List"
          description="Verify ledger balances and standing statuses"
          headerActions={
            <div className="flex items-center gap-3">
              <SearchBar
                placeholder="Search holder or account..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FilterBar
                options={[
                  { label: "All Statuses", value: "ALL" },
                  { label: "Active", value: "ACTIVE" },
                  { label: "Frozen", value: "FROZEN" },
                  { label: "Dormant", value: "DORMANT" }
                ]}
                selectedValue={filterStatus}
                onChange={setFilterStatus}
                label="Status"
              />
            </div>
          }
        >
          <SecurityDataTable
            data={filteredData}
            columns={columns}
            keyExtractor={(a) => a.accountNumber}
          />
        </DashboardCard>
      </div>
    </EmployeeLayout>
  );
}
