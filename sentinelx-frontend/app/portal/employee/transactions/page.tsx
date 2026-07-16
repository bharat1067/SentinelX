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

interface TxRecord {
  txId: string;
  accNum: string;
  type: "DEBIT" | "CREDIT" | "TRANSFER";
  amount: string;
  ip: string;
  status: "AUTHORIZED" | "PENDING" | "DENIED";
  time: string;
}

const MOCK_TXS: TxRecord[] = [
  { txId: "TX-9010", accNum: "10091876543", type: "DEBIT", amount: "₹450,000", ip: "10.15.2.14", status: "AUTHORIZED", time: "14:02:10" },
  { txId: "TX-9011", accNum: "10091876123", type: "CREDIT", amount: "₹120,000", ip: "10.12.1.80", status: "AUTHORIZED", time: "13:58:30" },
  { txId: "TX-9012", accNum: "10091876356", type: "TRANSFER", amount: "₹2,000,000", ip: "10.15.2.14", status: "AUTHORIZED", time: "13:51:22" },
  { txId: "TX-9013", accNum: "10091876400", type: "DEBIT", amount: "₹15,000", ip: "192.168.4.15", status: "AUTHORIZED", time: "13:40:00" },
  { txId: "TX-9014", accNum: "10091876918", type: "TRANSFER", amount: "₹1,800,000", ip: "198.51.100.42", status: "DENIED", time: "13:10:45" },
  { txId: "TX-9015", accNum: "10091876002", type: "CREDIT", amount: "₹8,400", ip: "10.12.1.85", status: "PENDING", time: "12:58:12" }
];

export default function TransactionsRegistry() {
  const router = useRouter();
  const { isAuthenticated, activePersona } = useUserStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL");

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

  const filteredData = MOCK_TXS.filter((tx) => {
    const matchesSearch = tx.txId.includes(searchQuery.toUpperCase()) || tx.accNum.includes(searchQuery);
    const matchesFilter = filterType === "ALL" || tx.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const columns = [
    {
      header: "Tx Transaction ID",
      accessor: (t: TxRecord) => <span className="font-semibold text-slate-400">{t.txId}</span>,
    },
    {
      header: "Account Number",
      accessor: (t: TxRecord) => <span className="font-mono">{t.accNum}</span>,
    },
    {
      header: "Transfer Type",
      accessor: (t: TxRecord) => <span className="font-mono text-slate-400">{t.type}</span>,
    },
    {
      header: "Amount (INR)",
      accessor: (t: TxRecord) => <span className="text-emerald-500 font-bold font-mono">{t.amount}</span>,
    },
    {
      header: "Host Source IP",
      accessor: (t: TxRecord) => <span className="text-slate-500 font-mono">{t.ip}</span>,
    },
    {
      header: "Validation Status",
      accessor: (t: TxRecord) => (
        <span
          className={
            t.status === "AUTHORIZED"
              ? "text-emerald-500 bg-emerald-500/10 border border-emerald-900/30 px-1.5 py-0.25 rounded text-[10px]"
              : t.status === "DENIED"
              ? "text-red-500 bg-red-950/20 border border-red-900/30 px-1.5 py-0.25 rounded text-[10px]"
              : "text-slate-500 bg-slate-900 border border-[#1f2937] px-1.5 py-0.25 rounded text-[10px]"
          }
        >
          {t.status}
        </span>
      ),
    },
    {
      header: "Executed Time",
      accessor: (t: TxRecord) => <span className="text-slate-500 font-mono">{t.time}</span>,
    },
  ];

  return (
    <EmployeeLayout>
      <WorkspaceHeader
        title="Dynamic Ledger Operations & Transactions"
        breadcrumbs={["Portal", "Transactions"]}
        status="OPERATIONAL"
        riskSummary={`${filteredData.length} Logs Loaded`}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        <DashboardCard
          title="Active Transactions Stream Ledger"
          description="Real-time operational records"
          headerActions={
            <div className="flex items-center gap-3">
              <SearchBar
                placeholder="Search Tx or Account..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FilterBar
                options={[
                  { label: "All Types", value: "ALL" },
                  { label: "Debit", value: "DEBIT" },
                  { label: "Credit", value: "CREDIT" },
                  { label: "Transfer", value: "TRANSFER" }
                ]}
                selectedValue={filterType}
                onChange={setFilterType}
                label="Type"
              />
            </div>
          }
        >
          <SecurityDataTable
            data={filteredData}
            columns={columns}
            keyExtractor={(t) => t.txId}
          />
        </DashboardCard>
      </div>
    </EmployeeLayout>
  );
}
